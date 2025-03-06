'use client';

import React, { useEffect, useState, useRef, useCallback, useContext } from 'react';
import { io, Socket } from 'socket.io-client';
import { Icon } from '@iconify/react';
import { useUserStore } from '@/store/useUserStore';
import { Dice } from '../Dice';
import { toast } from 'react-hot-toast';
import { getUserId, getOrCreateGuestId } from '@/utils/telegramWebApp';
import './style.css';
import { PageContainer } from '@/components/_layout/PageContainer';
import { WaitingRoom } from './WaitingRoom/index';

// Удаляем объявление глобального интерфейса, так как оно определено в global.d.ts

interface MultiplayerDiceGameProps {
  gameId: string;
  betAmount: number;
  onGameEnd?: (result: 'win' | 'lose' | 'draw') => void;
}

// Типы для игровых данных
type GameState = 'waiting' | 'playing' | 'finished';
type GameResult = 'win' | 'lose' | 'draw' | null;
type ConnectionStatus = 'connecting' | 'connected' | 'error';

interface PlayerData {
  id: string;
  username?: string;
  avatarUrl?: string;
  score?: number;
}

interface Player {
  telegramId: string;
  username?: string;
  avatarUrl?: string;
}

// Константы
const MAX_ATTEMPTS = 5;

// Компонент для отображения игрового поля
const GameField = ({ 
  playerDice, 
  opponentDice, 
  isRolling 
}: { 
  playerDice: number;
  opponentDice: number;
  isRolling: boolean;
}) => {
  const { telegramId } = useUserStore();
  const isPlayerTurn = useUserStore(state => state.isCurrentTurn);
  
  return (
    <div className="game-field">
      <div className="player-dice">
        <div className={`dice-container ${isRolling ? 'rolling' : ''}`}>
          <Dice 
            value={playerDice} 
            size="large" 
            rolling={isRolling}
          />
        </div>
      </div>
      
      <div className="vs-indicator">VS</div>
      
      <div className="opponent-dice">
        <div className={`dice-container ${isRolling ? 'rolling' : ''}`}>
          <Dice 
            value={opponentDice} 
            size="large"
            rolling={isRolling}
          />
        </div>
      </div>
    </div>
  );
};

// Компонент для отображения результатов
const GameResult = ({ result }: { result: GameResult }) => {
  if (!result) return null;
  
  return (
    <div className={`game-result ${result}`}>
      {result === 'win' && 'Вы выиграли!'}
      {result === 'lose' && 'Вы проиграли!'}
      {result === 'draw' && 'Ничья!'}
    </div>
  );
};

export function MultiplayerDiceGame({ 
  gameId, 
  betAmount, 
  onGameEnd 
}: MultiplayerDiceGameProps) {
  // Отладочный вывод для входящего значения ставки
  console.log('MultiplayerDiceGame received betAmount:', betAmount);
  console.log('MultiplayerDiceGame betAmount type:', typeof betAmount);
  
  // Проверяем, получаем ли мы информацию о ставке через socket
  useEffect(() => {
    // Подключаемся к socket.io для получения информации о ставке
    const socketUrl = process.env.NEXT_PUBLIC_API_URL || 'https://test.timecommunity.xyz';
    const socket = io(`${socketUrl}`, {
      path: '/socket.io',
      transports: ['websocket'],
      query: {
        gameId
      }
    });
    
    socket.on('connect', () => {
      console.log('Connected to socket to check game data');
      socket.emit('getGameInfo', { gameId });
    });
    
    socket.on('gameInfo', (gameInfo) => {
      console.log('Received game info from socket:', gameInfo);
      if (gameInfo && gameInfo.betAmount) {
        console.log('Полученная ставка через сокет:', gameInfo.betAmount);
      }
    });
    
    return () => {
      socket.disconnect();
    };
  }, [gameId]);
  
  // Состояния игры
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  const [opponentData, setOpponentData] = useState<PlayerData | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameState, setGameState] = useState<GameState>('waiting');
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [playerDice, setPlayerDice] = useState(1);
  const [opponentDice, setOpponentDice] = useState(1);
  const [currentRound, setCurrentRound] = useState(1);
  const [playerScore, setPlayerScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const [socketError, setSocketError] = useState<string | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  
  // Инициализируем displayedBetAmount с корректным значением из пропсов
  const [displayedBetAmount, setDisplayedBetAmount] = useState(() => {
    const numericBetAmount = Number(betAmount);
    return !isNaN(numericBetAmount) ? numericBetAmount : 0;
  });
  
  // Обновляем displayedBetAmount при изменении betAmount из пропсов
  useEffect(() => {
    const numericBetAmount = Number(betAmount);
    if (!isNaN(numericBetAmount)) {
      console.log('Updating displayedBetAmount from props:', numericBetAmount);
      setDisplayedBetAmount(numericBetAmount);
    }
  }, [betAmount]);
  
  // Для WebSocket
  const socketRef = useRef<Socket | null>(null);
  const connectionAttemptRef = useRef(0);
  const hasJoinedRoomRef = useRef(false); // Флаг для отслеживания присоединения к комнате
  const mounted = useRef(true); // Флаг для отслеживания состояния монтирования

  // Для Telegram данных
  const [userId, setUserId] = useState<string | null>(null);
  const telegramIdFromStore = useUserStore(state => state.telegramId);
  const [telegramId, setTelegramId] = useState<number | null>(
    telegramIdFromStore ? Number(telegramIdFromStore) : null
  );

  // Получение данных Telegram WebApp
  const getTelegramUserId = useCallback((): number | undefined => {
    try {
      // Сначала проверяем, есть ли у нас уже сохраненный userId
      if (userId) {
        console.log('Используем сохраненный userId:', userId);
        return parseInt(userId);
      }
      
      // Получаем userId из наших утилит
      const id = getUserId();
      if (id && id.startsWith('guest_')) {
        // Если это гостевой ID, не устанавливаем его как userId
        console.log('Получен гостевой ID:', id);
        return undefined;
      } else if (id) {
        // Если это реальный ID, устанавливаем его
        console.log('Получен userId из telegramWebApp:', id);
        setUserId(id);
        return parseInt(id);
      }
      
      // Если есть telegramId из хранилища
      if (telegramId) {
        console.log('Используем telegramId из хранилища:', telegramId);
        setUserId(telegramId.toString());
        return telegramId;
      }
      
      console.log('Не удалось получить userId, пользователь будет анонимным');
      return undefined;
    } catch (error) {
      console.error('Ошибка при получении userId:', error);
      return undefined;
    }
  }, [userId, telegramId]);
  
  // Упрощаем процесс проверки WebApp - он должен быть всегда доступен в Telegram
  useEffect(() => {
    // Получаем userId при монтировании компонента
    const id = getTelegramUserId();
    if (id) {
      setUserId(id.toString());
    }
    
    // Проверяем данные Telegram раз в секунду на случай, если они появятся позже
    const interval = setInterval(() => {
      // Проверяем только если мы ещё не получили userId
      if (!userId) {
        const newId = getTelegramUserId();
        if (newId) {
          console.log('Получен отложенный userId:', newId);
          setUserId(newId.toString());
          
          // Если у нас уже есть соединение, переподключаемся с новым ID
          if (socketRef.current) {
            console.log('Переподключение с новым userId');
            setupSocketConnection();
          }
        }
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [userId]);
  
  /**
   * Настраивает WebSocket соединение
   * Адаптировано для работы с исправленным API-путем в Nginx
   */
  const setupSocketConnection = useCallback((userIdParam?: string) => {
    console.log('Настройка соединения с сокетом, userId:', userIdParam || userId);
    
    // Проверяем, есть ли уже активное соединение
    if (socketRef.current && socketRef.current.connected && hasJoinedRoomRef.current) {
      console.log('Соединение уже установлено, пропускаем повторное подключение');
      return;
    }
    
    const effectiveUserId = userIdParam || userId;
    if (!effectiveUserId) {
      console.error('userId не определен, невозможно установить соединение');
      setConnectionStatus('error');
      setSocketError('Ошибка: ID пользователя не определен');
      return;
    }
    
    // Преобразуем userId в число, т.к. сервер ожидает telegramId как number
    const telegramId = parseInt(effectiveUserId, 10);
    
    if (isNaN(telegramId)) {
      console.error('Невозможно преобразовать userId в число:', effectiveUserId);
      setConnectionStatus('error');
      setSocketError('Ошибка: неверный формат ID пользователя');
      return;
    }
    
    console.log('Используется telegramId для подключения:', telegramId);
    
    // Конфигурация сокета
    const socketOptions = {
      // параметры для самого io подключения
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
      // Параметры для запроса
      query: { 
        telegramId: telegramId || '', // Передаем пустую строку вместо undefined
        userId: telegramId || '',     // Дублируем для совместимости
        gameId,
        timestamp: Date.now()
      },
      auth: {
        token: `${telegramId}_${gameId}`
      },
      extraHeaders: {
        'X-User-Id': String(telegramId), // Заголовки должны быть строками
        'X-Telegram-Id': String(telegramId),
        'X-Game-Id': gameId
      }
    };
    
    console.log('Параметры подключения:', socketOptions);
    
    try {
      // Если сокет уже существует, закрываем его
      if (socketRef.current) {
        console.log('Закрываем существующее соединение');
        socketRef.current.disconnect();
      }
    
      console.log('Создание нового соединения с параметрами:', socketOptions);
      const newSocket = io(`${process.env.NEXT_PUBLIC_API_URL || 'https://test.timecommunity.xyz'}`, socketOptions);
      
      socketRef.current = newSocket;
      connectionAttemptRef.current = 0;
      
      // Добавляем детальную отладку подключения
      newSocket.on('connect', () => {
        console.log('Socket connected successfully! Socket id:', newSocket.id);
        console.log('Socket query params:', newSocket.io.opts.query);
        console.log('Socket auth:', newSocket.auth);

        // Отправляем расширенную информацию о пользователе при подключении
        newSocket.emit('userInfo', { 
          userId: telegramId, 
          telegramId: telegramId,
          gameId,
          username: window.Telegram?.WebApp?.initDataUnsafe?.user?.username || 'unknown'
        });
        
        setConnectionStatus('connected');
        setSocketError(null);
        
        // После успешного подключения отправляем запрос на присоединение к комнате только если еще не присоединились
        if (!hasJoinedRoomRef.current) {
          console.log('Socket connected, joining game room:', gameId);
          newSocket.emit('joinGameRoom', { 
            gameId,
            telegramId, // Явно передаем telegramId
            username: window.Telegram?.WebApp?.initDataUnsafe?.user?.username || 'unknown'
          });
          
          // Запрашиваем информацию об игре только при первом подключении
          setTimeout(() => {
            if (newSocket.connected) {
              console.log('Запрашиваем начальное состояние игры');
              newSocket.emit('getGameStatus', { gameId });
              newSocket.emit('getGamePlayers', { gameId });
              hasJoinedRoomRef.current = true; // Устанавливаем флаг присоединения
            }
          }, 500);
        }
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setConnectionStatus('error');
        setSocketError(`Ошибка подключения: ${error.message}`);
        toast.error('Ошибка подключения к серверу');
        connectionAttemptRef.current += 1;
      });

      // Добавляем обработчик ошибок данных
      newSocket.on('error', (error) => {
        console.error('Ошибка сокета:', error);
        setSocketError(`Ошибка сокета: ${error.message || 'Неизвестная ошибка'}`);
      });

      // Добавляем обработчик для получения всех событий (отладка)
      newSocket.onAny((event, ...args) => {
        console.log(`Получено событие '${event}':`, args);
      });

      // Обработчик обновления состояния игры
      newSocket.on('gameStatus', (data) => {
        console.log('Получено состояние игры:', data);
        if (data.game && data.game.betAmount !== undefined) {
          const serverBetAmount = Number(data.game.betAmount);
          // Проверяем, нужно ли обновлять значение ставки
          if (!isNaN(serverBetAmount) && serverBetAmount > 0 && displayedBetAmount === 0) {
            console.log('Обновляем ставку с сервера:', serverBetAmount);
            setDisplayedBetAmount(serverBetAmount);
          } else {
            console.log('Сохраняем текущую ставку:', displayedBetAmount);
          }
        }
        // Обновляем состояние игры
        if (data.status) {
          setGameState(data.status);
        }
      });

      // Добавляем обработчик для приема списка игроков
      newSocket.on('gamePlayers', (data) => {
        console.log('Получен список игроков от сервера:', data);
        if (data && Array.isArray(data.players)) {
          setPlayers(data.players);
          
          // Определяем, кто из игроков - текущий пользователь
          const currentPlayer = data.players.find(
            (player: Player) => player.telegramId.toString() === telegramId.toString()
          );
          
          if (currentPlayer) {
            setPlayerData({
              id: currentPlayer.telegramId,
              username: currentPlayer.username,
              avatarUrl: currentPlayer.avatarUrl
            });
          }
          
          // Определяем, кто из игроков - оппонент
          const opponent = data.players.find(
            (player: Player) => player.telegramId.toString() !== telegramId.toString()
          );
          
          if (opponent) {
            setOpponentData({
              id: opponent.telegramId,
              username: opponent.username,
              avatarUrl: opponent.avatarUrl
            });
          }
        }
      });
      
      // Обработчик для начала игры в кости
      newSocket.on('diceGameStarted', (data) => {
        console.log('Игра в кости началась:', data);
        
        // Проверяем, что игра еще не в статусе playing, чтобы избежать повторного запуска
        if (gameState !== 'playing') {
          setGameState('playing');
          setGameStarted(true);
          toast.success('Игра началась!');
          
          // Определяем, чей первый ход
          const isFirstPlayer = data.firstPlayer.toString() === telegramId.toString();
          console.log('Первый ход определен:', { 
            firstPlayer: data.firstPlayer, 
            myId: telegramId, 
            isMyTurn: isFirstPlayer,
            telegramIdType: typeof telegramId
          });
          
          setIsMyTurn(isFirstPlayer);
          useUserStore.getState().setIsCurrentTurn(isFirstPlayer);
          
          if (isFirstPlayer) {
            toast.success('Ваш ход первый!');
          } else {
            toast('Ожидайте хода соперника', { icon: '⌛' });
          }
          
          // Сбрасываем счет и кубики
          setPlayerScore(0);
          setOpponentScore(0);
          setPlayerDice(1);
          setOpponentDice(1);
          setCurrentRound(1);
          setGameResult(null);
        } else {
          console.log('Игра уже запущена, игнорируем повторное событие diceGameStarted');
        }
      });

      // Добавляем обработчик хода в игре
      newSocket.on('diceMove', (data) => {
        console.log('Получен ход в игре:', data);
        
        // Проверяем полноту полученных данных
        if (!data || !data.nextMove) {
          console.error('Получены неполные данные о ходе:', data);
          return;
        }
        
        // Если ход сделал оппонент, обновляем его кубик
        if (data.telegramId.toString() !== telegramId.toString()) {
          console.log('Ход сделал оппонент, анимируем его бросок');
          // Запускаем анимацию броска оппонента
          setIsRolling(true);
          
          // Через секунду завершаем анимацию и устанавливаем результат
          setTimeout(() => {
            setOpponentDice(data.value);
            setIsRolling(false);
            console.log('Анимация броска оппонента завершена, результат:', data.value);
          }, 1000);
        }
        
        // Определяем, чей следующий ход
        if (data.nextMove) {
          const myNextTurn = data.nextMove.toString() === telegramId.toString();
          console.log('Следующий ход определен:', { 
            nextMove: data.nextMove, 
            myId: telegramId,
            nextMoveType: typeof data.nextMove,
            telegramIdType: typeof telegramId,
            isMyTurn: myNextTurn,
            сравнение: `${data.nextMove.toString()} === ${telegramId.toString()}`
          });
          
          setIsMyTurn(myNextTurn);
          useUserStore.getState().setIsCurrentTurn(myNextTurn);
          
          if (myNextTurn) {
            toast.success('Ваш ход!');
          } else {
            toast('Ход соперника', {
              icon: '🎲',
            });
          }
        } else {
          console.warn('В данных хода отсутствует информация о следующем игроке:', data);
        }
      });

      // Обработчик для результата раунда
      newSocket.on('roundResult', (data) => {
        console.log('Получен результат раунда:', data);
        
        // Обновляем номер текущего раунда
        setCurrentRound(data.round + 1);
        
        // Обновляем счет
        if (data.result === 'win') {
          setPlayerScore(prev => prev + 1);
        } else if (data.result === 'lose') {
          setOpponentScore(prev => prev + 1);
        }
        // При ничьей счет не меняется
      });

      // Добавляем обработчик для окончания игры
      newSocket.on('gameEnd', (data) => {
        console.log('Игра завершена:', data);
        
        // Определяем результат для текущего игрока
        const isWinner = data.winner === telegramId.toString();
        const result = isWinner ? 'win' : 'lose';
        
        // Устанавливаем результат игры
        setGameResult(result);
        setGameState('finished');
        
        // Вызываем колбэк окончания игры, если он предоставлен
        if (onGameEnd) {
          onGameEnd(result);
        }
      });

      // Добавляем обработчик статуса подключения
      newSocket.on('connectionStatus', (data) => {
        console.log('Получено обновление статуса подключения:', data);
        
        // Обновляем статус подключения
        if (data.connectedClients > 0) {
          setConnectionStatus('connected');
        } else {
          setConnectionStatus('error');
        }
        
        // Если игроков меньше 2, показываем сообщение
        if (data.connectedClients < 2 && gameState === 'playing') {
          toast.error('Соперник отключился от игры');
        } else if (data.connectedClients === 2 && gameState === 'waiting') {
          // Проверяем, что игра еще не запущена и оба игрока подключены
          console.log('Оба игрока подключены, запрашиваем статус игры');
          newSocket.emit('getGameStatus', { gameId });
          
          // Пробуем запустить игру, если она еще не началась
          if (!gameStarted) {
            console.log('Пробуем запустить игру');
            newSocket.emit('startDiceGame', { gameId });
          }
        }
      });

      // Сохраняем сокет
      socketRef.current = newSocket;
      setConnectionStatus('connecting');
    } catch (error) {
      console.error('Error setting up socket connection:', error);
      setConnectionStatus('error');
      setSocketError(`Ошибка при настройке соединения: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      toast.error('Не удалось установить соединение с сервером');
    }
  }, [gameId, userId]);

  // Обновляем данные, когда меняется playerData
  useEffect(() => {
    if (playerData && socketRef.current && gameState === 'waiting' && players.length === 2) {
      console.log('Player data updated, checking if we can start the game');
      // Если оба игрока присоединились, инициируем старт игры
      socketRef.current.emit('startDiceGame', { gameId });
    }
  }, [playerData, players.length, gameId, gameState]);

  // Функция для броска кубика
  const rollDice = () => {
    console.log('Нажата кнопка "Бросить кубик", текущее состояние:', {
      isRolling,
      isMyTurn,
      gameState,
      currentRound,
      telegramId
    });
    
    // Проверяем, что сейчас наш ход и анимация не запущена
    if (isRolling || !isMyTurn) {
      console.log('Нельзя бросать кубик:', { isRolling, isMyTurn });
      return;
    }
    
    // Дополнительная проверка telegramId перед отправкой хода
    if (!telegramId) {
      console.error('Отсутствует telegramId пользователя, невозможно сделать ход');
      toast.error('Ошибка: не удалось определить идентификатор пользователя');
      return;
    }
    
    console.log('Начинаем бросок кубика, наш ход:', isMyTurn);
    
    // Начинаем анимацию для кубика игрока
    setIsRolling(true);
    console.log('Multiplayer roll initiated');
    
    // Генерируем случайное значение от 1 до 6
    const diceValue = Math.floor(Math.random() * 6) + 1;
    
    // Отправляем событие на сервер сразу, не дожидаясь окончания анимации
    if (socketRef.current) {
      const userTelegramId = Number(telegramId);
      console.log('Отправляем ход с значением:', diceValue, 'от игрока с telegramId:', userTelegramId);
      
      // Дополнительно проверяем, что telegramId не null и не NaN после преобразования
      if (isNaN(userTelegramId)) {
        console.error('Ошибка: telegramId не является числом:', telegramId);
        toast.error('Ошибка при отправке хода');
        setIsRolling(false);
        return;
      }
      
      socketRef.current.emit('diceMove', {
        gameId,
        value: diceValue,
        telegramId: userTelegramId // Явно преобразуем в число, чтобы избежать проблем с типами
      });
      
      // Обновляем значение кубика игрока на клиенте
      setTimeout(() => {
        setPlayerDice(diceValue);
      }, 500); // Обновляем значение на полпути анимации
    } else {
      console.error('Ошибка: отсутствует соединение с сервером');
      toast.error('Ошибка: нет соединения с сервером');
      setIsRolling(false);
    }
    
    // Анимация броска длится 1 секунду
    setTimeout(() => {
      setIsRolling(false);
      console.log('Multiplayer roll completed');
      
      // Передаем ход другому игроку, меняя isMyTurn на false
      // Ожидаем, что сервер отправит реальное обновление через событие diceMove
      setIsMyTurn(false);
    }, 1000);
  };

  // Функция для копирования пригласительной ссылки
  const copyInviteLink = () => {
    const inviteLink = `https://t.me/neometria_bot?startapp=game_${gameId}`;
    console.log('Copying invite link:', inviteLink);
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(inviteLink)
        .then(() => {
          toast.success('Ссылка скопирована!');
        })
        .catch(err => {
          console.error('Ошибка при копировании:', err);
          toast.error('Не удалось скопировать ссылку');
        });
    } else {
      // Fallback для старых браузеров
      const textArea = document.createElement('textarea');
      textArea.value = inviteLink;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        document.execCommand('copy');
        toast.success('Ссылка скопирована!');
      } catch (err) {
        console.error('Ошибка при копировании:', err);
        toast.error('Не удалось скопировать ссылку');
      }
      
      document.body.removeChild(textArea);
    }
  };

  // Функция для ручного входа в игру
  const handleManualJoin = () => {
    // Перенаправляем на страницу с текущей игрой
    const fullGameId = `game_${gameId}`;
    window.location.href = `https://t.me/neometria_bot?startapp=${fullGameId}`;
  };

  // Подключаемся к WebSocket при монтировании компонента
  useEffect(() => {
    console.log('MultiplayerDiceGame component mounted with gameId:', gameId);
    
    // Сначала пытаемся получить userId из Telegram WebApp
    const currentUserId = getTelegramUserId();
    if (currentUserId) {
      console.log('userId сразу получен из WebApp:', currentUserId);
      // Важно: устанавливаем состояние и передаём userId напрямую в функцию подключения
      setUserId(currentUserId.toString());
      
      // Проверяем, есть ли уже активное соединение
      if (socketRef.current && socketRef.current.connected && hasJoinedRoomRef.current) {
        console.log('Соединение уже установлено, пропускаем повторное подключение');
      } else {
        setupSocketConnection(currentUserId.toString());
      }
    } else {
      console.log('userId не получен при первой загрузке, ожидаем...');
      // Если userId не получен, ждем 1 секунду и пробуем снова
      const timer = setTimeout(() => {
        const delayedUserId = getTelegramUserId();
        if (delayedUserId) {
          console.log('userId получен с задержкой:', delayedUserId);
          setUserId(delayedUserId.toString());
          
          // Проверяем, есть ли уже активное соединение
          if (socketRef.current && socketRef.current.connected && hasJoinedRoomRef.current) {
            console.log('Соединение уже установлено, пропускаем повторное подключение');
          } else {
            setupSocketConnection(delayedUserId.toString());
          }
        } else {
          console.log('userId не получен даже после задержки, используем пользователя-гостя');
          // Если всё ещё не удалось получить userId, создаем гостевой ID
          const guestId = getOrCreateGuestId();
          setUserId(guestId);
          
          // Проверяем, есть ли уже активное соединение
          if (socketRef.current && socketRef.current.connected && hasJoinedRoomRef.current) {
            console.log('Соединение уже установлено, пропускаем повторное подключение');
          } else {
            setupSocketConnection(guestId);
          }
        }
      }, 1000);
      
      return () => {
        clearTimeout(timer);
        if (socketRef.current) {
          console.log('MultiplayerDiceGame component unmounting, disconnecting socket');
          socketRef.current.disconnect();
        }
      };
    }
    
    // Предотвращаем случайные свайпы на iOS, которые закрывают приложение
    const preventSwipe = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };
    
    document.addEventListener('touchstart', preventSwipe, { passive: false });
    
    // Очистка при размонтировании
    return () => {
      console.log('MultiplayerDiceGame component unmounting, disconnecting socket');
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      document.removeEventListener('touchstart', preventSwipe);
    };
  }, [gameId]);

  // Добавляем эффект для запроса обновления списка игроков после подключения
  useEffect(() => {
    if (connectionStatus === 'connected' && socketRef.current && userId) {
      console.log('Соединение установлено, запрашиваем список игроков');
      
      // Преобразуем userId в число
      const telegramId = parseInt(userId, 10);
      
      // Сначала пробуем запросить игроков
      socketRef.current.emit('getGamePlayers', { 
        gameId, 
        userId: telegramId,
        telegramId: telegramId
      });
      
      // Затем пробуем присоединиться, если ещё не присоединились
      if (!hasJoinedRoomRef.current) {
        socketRef.current.emit('joinGameRoom', { 
          gameId,
          telegramId, // Явно передаем telegramId
          username: window.Telegram?.WebApp?.initDataUnsafe?.user?.username || 'unknown'
        });
        
        // Отправляем информацию о пользователе (вдруг сервер ее использует)
        socketRef.current.emit('userInfo', { 
          userId: telegramId, 
          telegramId: telegramId,
          gameId,
          username: window.Telegram?.WebApp?.initDataUnsafe?.user?.username || 'unknown'
        });
        
        hasJoinedRoomRef.current = true;
      }
      
      // Устанавливаем интервал для периодического обновления списка игроков
      const interval = setInterval(() => {
        if (socketRef.current && socketRef.current.connected) {
          console.log('Периодическое обновление списка игроков');
          socketRef.current.emit('getGamePlayers', { 
            gameId,
            userId: telegramId,
            telegramId: telegramId
          });
        }
      }, 5000); // Запрашиваем обновление каждые 5 секунд
      
      return () => clearInterval(interval);
    }
  }, [connectionStatus, gameId, userId]);

  // Добавляем эффект для обновления telegramId при изменении в хранилище
  useEffect(() => {
    if (telegramIdFromStore) {
      const numericId = Number(telegramIdFromStore);
      if (!isNaN(numericId)) {
        console.log('Обновляем telegramId из хранилища:', numericId);
        setTelegramId(numericId);
      } else {
        console.error('TelegramId в хранилище не является числом:', telegramIdFromStore);
      }
    }
  }, [telegramIdFromStore]);

  // Для более надежной инициализации telegramId
  useEffect(() => {
    // Пытаемся получить telegramId из нескольких источников
    const initTelegramId = () => {
      // Проверяем значение из хранилища
      if (telegramId) {
        console.log('telegramId уже установлен:', telegramId);
        return;
      }
      
      // Пытаемся получить из хранилища
      if (telegramIdFromStore) {
        const numericId = Number(telegramIdFromStore);
        if (!isNaN(numericId)) {
          console.log('Установка telegramId из хранилища:', numericId);
          setTelegramId(numericId);
          return;
        }
      }
      
      // Пытаемся получить из Telegram WebApp
      const id = getTelegramUserId();
      if (id) {
        console.log('Установка telegramId из Telegram WebApp:', id);
        setTelegramId(id);
        return;
      }
      
      console.warn('Не удалось определить telegramId пользователя');
    };
    
    initTelegramId();
  }, []);

  // Если есть проблемы с соединением
  if (connectionStatus === 'error') {
    return (
      <PageContainer>
        <div className="dice-game">
          <div className="game-info">
            <h1>Ошибка соединения</h1>
          </div>
          <div className="error-container">
            <p>{socketError || 'Не удалось подключиться к серверу'}</p>
            <button 
              className="reload-button"
              onClick={() => {
                connectionAttemptRef.current = 0;
                setupSocketConnection();
              }}
            >
              Переподключиться
            </button>
          </div>
        </div>
      </PageContainer>
    );
  }

  // Если соединение устанавливается
  if (connectionStatus === 'connecting') {
    return (
      <PageContainer>
        <div className="dice-game">
          <div className="game-info">
            <h1>Подключение к игре</h1>
          </div>
          <div className="connecting-container">
            <div className="loading-spinner"></div>
            <p>Устанавливается соединение с сервером...</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  // Если игра в режиме ожидания
  if (gameState === 'waiting') {
    console.log('Rendering WaitingRoom with betAmount:', displayedBetAmount);
    return (
      <PageContainer>
        <WaitingRoom
          gameId={gameId}
          betAmount={displayedBetAmount}
          players={players}
          connectionStatus={connectionStatus}
          socketError={socketError}
          onCopyInviteLink={copyInviteLink}
          onReconnect={() => setupSocketConnection()}
          onManualJoin={handleManualJoin}
        />
      </PageContainer>
    );
  }

  // Если игра в процессе
  if (gameState === 'playing') {
    return (
      <PageContainer>
        <div className="dice-game">
          <div className="game-header">
            <div className="score">
              <div className="player-side">
                <div className={`player-avatar ${isMyTurn ? 'active-turn' : ''}`}>
                  {playerData?.avatarUrl ? (
                    <img src={playerData.avatarUrl} alt={playerData.username || 'Player'} />
                  ) : (
                    <Icon icon="mdi:account-circle" />
                  )}
                  {isMyTurn && <div className="turn-indicator">Ваш ход</div>}
                </div>
                <div className="player-score">{playerScore}</div>
              </div>
              
              <div className="round-info">
                <div className="round-number">Раунд {currentRound}/3</div>
                <div className="bet-amount">
                  <Icon icon="material-symbols:diamond-rounded" />
                  <span>{displayedBetAmount}</span>
                </div>
              </div>
              
              <div className="opponent-side">
                <div className="opponent-score">{opponentScore}</div>
                <div className={`opponent-avatar ${!isMyTurn ? 'active-turn' : ''}`}>
                  {opponentData?.avatarUrl ? (
                    <img src={opponentData.avatarUrl} alt={opponentData.username || 'Opponent'} />
                  ) : (
                    <Icon icon="mdi:account-circle" />
                  )}
                  {!isMyTurn && <div className="turn-indicator">Ходит</div>}
                </div>
              </div>
            </div>
          </div>

          <GameField 
            playerDice={playerDice}
            opponentDice={opponentDice}
            isRolling={isRolling}
          />
          
          <div className="controls-area">
            {gameResult ? (
              <GameResult result={gameResult} />
            ) : (
              <button 
                className={`roll-button ${isMyTurn && !isRolling ? 'active' : 'inactive'}`}
                onClick={rollDice}
                disabled={isRolling || !isMyTurn}
              >
                {isMyTurn ? (isRolling ? 'Бросаем...' : 'Бросить кубик') : 'Ожидание хода соперника'}
              </button>
            )}
          </div>
        </div>
      </PageContainer>
    );
  }

  // Если игра закончена
  if (gameState === 'finished') {
    return (
      <PageContainer>
        <div className="dice-game">
          <div className="game-info">
            <h1>Игра завершена</h1>
            <div className="bet-info">
              <Icon icon="material-symbols:diamond-rounded" />
              <span>{displayedBetAmount}</span>
            </div>
          </div>
          
          <div className="game-container">
            {/* Оппонент */}
            <div className="player-container">
              <div className="player-info">
                <div className="player-avatar">
                  {opponentData?.avatarUrl ? (
                    <img src={opponentData.avatarUrl} alt="avatar" />
                  ) : (
                    <Icon icon="mdi:account" />
                  )}
                </div>
                <div className="player-name">
                  {opponentData?.username || 'Соперник'}
                </div>
              </div>
              
              <div className="dice-container">
                <Dice value={opponentDice} />
              </div>
            </div>
            
            {/* Разделитель */}
            <div className="vs-indicator">VS</div>
            
            {/* Игрок */}
            <div className="player-container">
              <div className="dice-container">
                <Dice value={playerDice} />
              </div>
              
              <div className="player-info">
                <div className="player-avatar">
                  {playerData?.avatarUrl ? (
                    <img src={playerData.avatarUrl} alt="avatar" />
                  ) : (
                    <Icon icon="mdi:account" />
                  )}
                </div>
                <div className="player-name">
                  {playerData?.username || 'Вы'}
                </div>
              </div>
            </div>
          </div>
          
          <div className={`game-result ${gameResult}`}>
            <h2>
              {gameResult === 'win' && 'Вы победили!'}
              {gameResult === 'lose' && 'Вы проиграли!'}
              {gameResult === 'draw' && 'Ничья!'}
            </h2>
          </div>
        </div>
      </PageContainer>
    );
  }

  // Обновляем возвращаемый JSX для лучшей интеграции с макетом
  return (
    <PageContainer>
      <div className="dice-game">
        <div className="game-header">
          <div className="score">
            <div className="player-side">
              <div className={`player-avatar ${isMyTurn ? 'active-turn' : ''}`}>
                {playerData?.avatarUrl ? (
                  <img src={playerData.avatarUrl} alt={playerData.username || 'Player'} />
                ) : (
                  <Icon icon="mdi:account-circle" />
                )}
                {isMyTurn && <div className="turn-indicator">Ваш ход</div>}
              </div>
              <div className="player-score">{playerScore}</div>
            </div>
            
            <div className="round-info">
              <div className="round-number">Раунд {currentRound}/3</div>
              <div className="bet-amount">
                <Icon icon="material-symbols:diamond-rounded" />
                <span>{displayedBetAmount}</span>
              </div>
            </div>
            
            <div className="opponent-side">
              <div className="opponent-score">{opponentScore}</div>
              <div className={`opponent-avatar ${!isMyTurn ? 'active-turn' : ''}`}>
                {opponentData?.avatarUrl ? (
                  <img src={opponentData.avatarUrl} alt={opponentData.username || 'Opponent'} />
                ) : (
                  <Icon icon="mdi:account-circle" />
                )}
                {!isMyTurn && <div className="turn-indicator">Ходит</div>}
              </div>
            </div>
          </div>
        </div>

        <GameField 
          playerDice={playerDice}
          opponentDice={opponentDice}
          isRolling={isRolling}
        />
        
        <div className="controls-area">
          {gameResult ? (
            <GameResult result={gameResult} />
          ) : (
            <button 
              className={`roll-button ${isMyTurn && !isRolling ? 'active' : 'inactive'}`}
              onClick={rollDice}
              disabled={isRolling || !isMyTurn}
            >
              {isMyTurn ? (isRolling ? 'Бросаем...' : 'Бросить кубик') : 'Ожидание хода соперника'}
            </button>
          )}
        </div>
      </div>
    </PageContainer>
  );
} 