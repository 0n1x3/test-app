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

// Компонент для отображения статуса подключения
const ConnectionStatusIndicator = ({ status }: { status: ConnectionStatus }) => {
  return (
    <div className={`connection-status ${status}`}>
      <div className="connection-indicator-dot"></div>
      <span>
        {(() => {
          switch (status) {
            case 'connecting':
              return 'Подключение...';
            case 'connected':
              return 'Подключено';
            case 'error':
              return 'Ошибка подключения';
            default:
              return '';
          }
        })()}
      </span>
    </div>
  );
};

export function MultiplayerDiceGame({ 
  gameId, 
  betAmount, 
  onGameEnd 
}: MultiplayerDiceGameProps) {
  // Состояния игры
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  const [opponentData, setOpponentData] = useState<PlayerData | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameState, setGameState] = useState<GameState>('waiting');
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [playerDice, setPlayerDice] = useState(1);
  const [opponentDice, setOpponentDice] = useState(1);
  const [round, setRound] = useState(1);
  const [playerScore, setPlayerScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const [socketError, setSocketError] = useState<string | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  
  // Для WebSocket
  const socketRef = useRef<Socket | null>(null);
  const connectionAttemptRef = useRef(0);
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
        telegramId: telegramId, // Явно передаем как число
        userId: telegramId,     // Дублируем для совместимости
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
        
        // После успешного подключения отправляем запрос на присоединение к комнате и получение списка игроков
        console.log('Joining game room:', gameId);
        newSocket.emit('joinGameRoom', { 
          gameId,
          userId: telegramId, 
          telegramId: telegramId,
          username: window.Telegram?.WebApp?.initDataUnsafe?.user?.username || 'unknown'
        });
        console.log('Requesting game players list');
        newSocket.emit('getGamePlayers', { 
          gameId,
          userId: telegramId,
          telegramId: telegramId
        });
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

      // Явно запрашиваем обновление игры через секунду после подключения
      newSocket.on('connect', () => {
        setTimeout(() => {
          if (newSocket.connected) {
            console.log('Запрашиваем обновление игры');
            newSocket.emit('updateGame', { gameId });
            // Повторно запрашиваем список игроков
            newSocket.emit('getGamePlayers', { gameId });
          }
        }, 1000);
      });

      // Добавляем обработчик для приема списка игроков
      newSocket.on('gamePlayers', (data) => {
        console.log('Получен список игроков от сервера:', data);
        if (data && Array.isArray(data.players)) {
          console.log(`Установка списка игроков (${data.players.length}):`, data.players);
          
          // Преобразуем данные игроков
          const processedPlayers = data.players.map((player: any) => {
            // Убедимся, что telegramId сохраняется как число или строка
            return {
              ...player,
              telegramId: player.telegramId || player.id || player.userId || null
            };
          });
          
          console.log('Обработанные данные игроков:', processedPlayers);
          setPlayers(processedPlayers);
          
          // Проверяем, включен ли текущий пользователь в список игроков
          const currentUserTgId = parseInt(userId || '0', 10);
          const isCurrentUserInList = processedPlayers.some(
            (p: any) => (p.telegramId && p.telegramId.toString() === currentUserTgId.toString())
          );
          
          if (!isCurrentUserInList && processedPlayers.length > 0 && userId) {
            console.log('Текущий пользователь не найден в списке игроков, добавляем его локально');
            
            // Добавляем текущего пользователя в локальный список
            const userData = window.Telegram?.WebApp?.initDataUnsafe?.user;
            const updatedPlayers = [
              ...processedPlayers,
              {
                telegramId: currentUserTgId,
                username: userData?.username || `Player ${userId.substring(0, 4)}`,
                avatarUrl: userData?.photo_url || ''
              }
            ];
            
            console.log('Обновленный список игроков с текущим пользователем:', updatedPlayers);
            setPlayers(updatedPlayers);
            
            // Также информируем сервер о новом пользователе
            newSocket.emit('updateGame', {
              gameId,
              userId: currentUserTgId,
              telegramId: currentUserTgId,
              players: updatedPlayers
            });
          }
        } else {
          console.error('Неверный формат данных игроков:', data);
        }
      });
      
      // Добавляем обработчик обновления игры
      newSocket.on('gameUpdated', (data) => {
        console.log('Получено обновление игры:', data);
        if (data?.players && Array.isArray(data.players)) {
          console.log('Обновление списка игроков из события gameUpdated:', data.players);
          setPlayers(data.players);
        }
      });

      // Добавляем обработчик события начала игры
      newSocket.on('diceGameStarted', (data) => {
        console.log('Получено событие начала игры:', data);
        setGameState('playing');
        
        // Определяем, кто ходит первым
        if (data.firstPlayer !== undefined) {
          const currentUserTgId = parseInt(userId || '0', 10);
          
          // Если firstPlayer - это индекс игрока (0 или 1)
          if (typeof data.firstPlayer === 'number') {
            const playersList = data.players || players;
            if (playersList && playersList.length > data.firstPlayer) {
              const firstPlayerTgId = playersList[data.firstPlayer].telegramId;
              setIsMyTurn(firstPlayerTgId.toString() === currentUserTgId.toString());
            }
          } 
          // Если firstPlayer - это telegramId игрока
          else if (typeof data.firstPlayer === 'string') {
            setIsMyTurn(data.firstPlayer === currentUserTgId.toString());
          }
          
          console.log(`Игра началась! Мой ход: ${isMyTurn}`);
          toast.success('Игра началась!');
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
          // Если оба игрока подключены и игра в режиме ожидания, пробуем запустить игру
          newSocket.emit('startDiceGame', { gameId });
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

  // Подключаемся к WebSocket при монтировании компонента
  useEffect(() => {
    console.log('MultiplayerDiceGame component mounted with gameId:', gameId);
    
    // Сначала пытаемся получить userId из Telegram WebApp
    const currentUserId = getTelegramUserId();
    if (currentUserId) {
      console.log('userId сразу получен из WebApp:', currentUserId);
      // Важно: устанавливаем состояние и передаём userId напрямую в функцию подключения
      setUserId(currentUserId.toString());
      setupSocketConnection(currentUserId.toString());
    } else {
      console.log('userId не получен при первой загрузке, ожидаем...');
      // Если userId не получен, ждем 1 секунду и пробуем снова
      const timer = setTimeout(() => {
        const delayedUserId = getTelegramUserId();
        if (delayedUserId) {
          console.log('userId получен с задержкой:', delayedUserId);
          setUserId(delayedUserId.toString());
          setupSocketConnection(delayedUserId.toString());
        } else {
          console.log('userId не получен даже после задержки, используем пользователя-гостя');
          // Если всё ещё не удалось получить userId, создаем гостевой ID
          const guestId = getOrCreateGuestId();
          setUserId(guestId);
          setupSocketConnection(guestId);
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
    if (isRolling) return;
    setIsRolling(true);
    console.log('Multiplayer roll initiated');
    // Здесь можно добавить отправку события через сокет для броска кубика
    setTimeout(() => {
      setIsRolling(false);
      console.log('Multiplayer roll completed');
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

  // После получения userId, обновляем сокет
  useEffect(() => {
    if (userId && !socketRef.current) {
      console.log('userId получен, инициализируем соединение:', userId);
      
      // Преобразуем userId в число
      const telegramId = parseInt(userId, 10);
      
      // Предварительно регистрируем пользователя через REST API
      // Это может помочь серверу распознать пользователя в WebSocket соединении
      const userData = window.Telegram?.WebApp?.initDataUnsafe?.user;
      if (userData) {
        console.log('Регистрируем пользователя перед WebSocket подключением:', userData);
        
        // Отправляем запрос на инициализацию пользователя
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://test.timecommunity.xyz'}/api/users/init`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          },
          body: JSON.stringify({
            initData: window.Telegram?.WebApp?.initData || ''
          })
        })
        .then(res => res.json())
        .then(data => {
          console.log('Пользователь зарегистрирован:', data);
          // После регистрации пользователя устанавливаем соединение
          setupSocketConnection(userId);
        })
        .catch(err => {
          console.error('Ошибка при регистрации пользователя:', err);
          // Даже при ошибке регистрации пробуем подключиться
          setupSocketConnection(userId);
        });
      } else {
        // Если нет данных пользователя, просто пытаемся подключиться
        setupSocketConnection(userId);
      }
    }
  }, [userId, setupSocketConnection]);

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
      socketRef.current.emit('joinGameRoom', { 
        gameId,
        userId: telegramId,
        telegramId: telegramId,
        username: window.Telegram?.WebApp?.initDataUnsafe?.user?.username || 'unknown'
      });
      
      // Отправляем информацию о пользователе (вдруг сервер ее использует)
      socketRef.current.emit('userInfo', { 
        userId: telegramId, 
        telegramId: telegramId,
        gameId,
        username: window.Telegram?.WebApp?.initDataUnsafe?.user?.username || 'unknown'
      });
      
      // Через секунду проверяем, есть ли игроки
      setTimeout(() => {
        console.log('Проверка списка игроков через 1 секунду:', players);
        if (players.length === 0 && socketRef.current) {
          console.log('Игроки не получены, повторно запрашиваем');
          
          // Пробуем прямое обновление списка игроков через REST API
          fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://test.timecommunity.xyz'}/api/games/${gameId}?timestamp=${Date.now()}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache'
            }
          })
            .then(response => response.json())
            .then(data => {
              console.log('Получены данные игры через REST API:', data);
              if (data.success && data.game && data.game.players) {
                console.log('Установка игроков из REST API:', data.game.players);
                setPlayers(data.game.players);
              }
            })
            .catch(error => {
              console.error('Ошибка получения данных игры:', error);
            });
          
          // Также пробуем через Socket.IO
          socketRef.current.emit('getGamePlayers', { 
            gameId,
            userId: telegramId,
            telegramId: telegramId
          });
          
          // Также запрашиваем обновление игры на сервере
          socketRef.current.emit('updateGame', { 
            gameId,
            userId: telegramId,
            telegramId: telegramId
          });
        }
      }, 1000);
      
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
  }, [connectionStatus, gameId, players, userId]);

  // Новый эффект для обновления игроков при изменении подключения
  useEffect(() => {
    // Проверяем есть ли подключение и установленный userId
    if (connectionStatus === 'connected' && userId) {
      // Если игроков меньше чем ожидаем, пробуем получить данные напрямую из API
      console.log('Обновление списка игроков после изменения статуса подключения');
      
      // Преобразуем userId в число
      const telegramId = parseInt(userId, 10);
      
      // Используем таймаут для того, чтобы дать WebSocket соединению время на обработку
      setTimeout(() => {
        // Если до сих пор нет игроков, попробуем обновить их через REST API
        if (players.length < 1) {
          console.log('Игроки не получены после установки соединения, получаем через REST API');
          
          // Форсируем получение информации об игре через HTTP запрос
          fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://test.timecommunity.xyz'}/api/games/${gameId}?_=${Date.now()}`, {
            headers: {
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache',
              'X-User-Id': String(telegramId),
              'X-Telegram-Id': String(telegramId)
            }
          })
            .then(res => res.json())
            .then(data => {
              if (data.success && data.game && Array.isArray(data.game.players)) {
                console.log('Получены игроки через REST API:', data.game.players);
                
                // Если пользователя нет в списке игроков, добавляем его
                let updatedPlayers = [...data.game.players];
                const currentUserInList = updatedPlayers.some(
                  p => p.telegramId && p.telegramId.toString() === userId
                );
                
                if (!currentUserInList) {
                  // Добавляем текущего пользователя в список, если его там нет
                  const userData = window.Telegram?.WebApp?.initDataUnsafe?.user;
                  console.log('Добавляем текущего пользователя в список игроков', userData);
                  
                  updatedPlayers.push({
                    telegramId: userId,
                    username: userData?.username || `Player ${userId.substring(0, 4)}`,
                    avatarUrl: userData?.photo_url || null
                  });
                }
                
                console.log('Установка обновленного списка игроков:', updatedPlayers);
                setPlayers(updatedPlayers);
                
                // Если игра уже ожидает игроков, запускаем обновление статуса
                if (data.game.status === 'waiting' && updatedPlayers.length > 0) {
                  console.log('Игра в статусе ожидания с игроками, отправляем updateGame');
                  socketRef.current?.emit('updateGame', { 
                    gameId, 
                    userId,
                    players: updatedPlayers
                  });
                }
              }
            })
            .catch(err => {
              console.error('Ошибка при получении игроков через REST API:', err);
            });
        }
      }, 2000);
    }
  }, [connectionStatus, gameId, players, userId]);

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
    return (
      <PageContainer>
        <div className="dice-game">
          {/* Индикатор статуса подключения */}
          <ConnectionStatusIndicator status={connectionStatus} />
          
          {/* Информация о ставке */}
          <div className="game-header">
            <h2>Игра в кости</h2>
            <div className="bet-info">
              <Icon icon="material-symbols:diamond-rounded" className="bet-info__icon" />
              <span className="bet-info__amount">{betAmount}</span>
            </div>
          </div>
          
          {/* Отображение информации о ставке */}
          <div className="bet-info">
            <Icon icon="material-symbols:diamond-rounded" className="bet-info__icon" />
            <span className="bet-info__amount">{betAmount}</span>
          </div>
          
          {connectionStatus !== 'connected' ? (
            <div className="connecting-container">
              <div className="loading-spinner"></div>
              <p>Подключение к игре...</p>
              {socketError && (
                <div className="error-container">
                  <p>{socketError}</p>
                  <button className="reload-button" onClick={() => setupSocketConnection()}>
                    Повторить подключение
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="waiting-container">
              <h2>Ожидание соперника</h2>
              <p>Поделитесь ссылкой с другом или дождитесь пока кто-то присоединится</p>
              
              <div className="copy-link-button">
                <button onClick={copyInviteLink}>
                  <Icon icon="mdi:content-copy" />
                  <span>Скопировать ссылку</span>
                </button>
              </div>
              
              <div className="player-count">
                <p>Подключенные игроки ({players.length}/2):</p>
                {players.length === 0 ? (
                  <p className="no-players">Ожидание подключения игроков...</p>
                ) : (
                  <div className="players-list">
                    {players.map((player, index) => (
                      <div key={index} className="player-item">
                        <div className="player-avatar">
                          {player.avatarUrl ? (
                            <img src={player.avatarUrl} alt={player.username || 'Игрок'} />
                          ) : (
                            <span className="avatar-placeholder">👤</span>
                          )}
                        </div>
                        <span className="player-name">{player.username || `Игрок ${index + 1}`}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
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
                <div className="player-avatar">
                  {playerData?.avatarUrl ? (
                    <img src={playerData.avatarUrl} alt={playerData.username || 'Player'} />
                  ) : (
                    <Icon icon="mdi:account-circle" />
                  )}
                </div>
                <div className="player-score">{playerScore}</div>
              </div>
              
              <div className="round-info">
                <div className="round-number">Раунд {round}/3</div>
                <div className="bet-amount">
                  <Icon icon="material-symbols:diamond-rounded" />
                  {betAmount}
                </div>
              </div>
              
              <div className="bot-side">
                <div className="bot-score">{opponentScore}</div>
                <div className="bot-avatar">
                  {opponentData?.avatarUrl ? (
                    <img src={opponentData.avatarUrl} alt={opponentData.username || 'Opponent'} />
                  ) : (
                    <Icon icon="mdi:account-circle" />
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="game-field">
            <div className="bot-dice-container">
              <div className="dice-wrapper">
                <Dice 
                  value={opponentDice} 
                  rolling={isRolling}
                  size="large"
                />
              </div>
            </div>
            
            <div className="vs-indicator">VS</div>
            
            <div className="player-dice-container">
              <div className="dice-wrapper">
                <Dice 
                  value={playerDice} 
                  rolling={isRolling}
                  size="large"
                />
              </div>
            </div>
          </div>
          
          <div className="controls-area">
            {gameResult ? (
              <div className={`game-result ${gameResult}`}>
                {gameResult === 'win' && 'Вы выиграли!'}
                {gameResult === 'lose' && 'Вы проиграли!'}
                {gameResult === 'draw' && 'Ничья!'}
              </div>
            ) : (
              <button 
                className="roll-button" 
                onClick={rollDice} 
                disabled={isRolling || !isMyTurn}
              >
                Бросить кубик
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
              <span>{betAmount}</span>
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
              <div className="player-avatar">
                {playerData?.avatarUrl ? (
                  <img src={playerData.avatarUrl} alt={playerData.username || 'Player'} />
                ) : (
                  <Icon icon="mdi:account-circle" />
                )}
              </div>
              <div className="player-score">{playerScore}</div>
            </div>
            
            <div className="round-info">
              <div className="round-number">Раунд {round}/3</div>
              <div className="bet-amount">
                <Icon icon="material-symbols:diamond-rounded" />
                {betAmount}
              </div>
            </div>
            
            <div className="bot-side">
              <div className="bot-score">{opponentScore}</div>
              <div className="bot-avatar">
                {opponentData?.avatarUrl ? (
                  <img src={opponentData.avatarUrl} alt={opponentData.username || 'Opponent'} />
                ) : (
                  <Icon icon="mdi:account-circle" />
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="game-field">
          <div className="bot-dice-container">
            <div className="dice-wrapper">
              <Dice 
                value={opponentDice} 
                rolling={isRolling}
                size="large"
              />
            </div>
          </div>
          
          <div className="vs-indicator">VS</div>
          
          <div className="player-dice-container">
            <div className="dice-wrapper">
              <Dice 
                value={playerDice} 
                rolling={isRolling}
                size="large"
              />
            </div>
          </div>
        </div>
        
        <div className="controls-area">
          {gameResult ? (
            <div className={`game-result ${gameResult}`}>
              {gameResult === 'win' && 'Вы выиграли!'}
              {gameResult === 'lose' && 'Вы проиграли!'}
              {gameResult === 'draw' && 'Ничья!'}
            </div>
          ) : (
            <button 
              className="roll-button" 
              onClick={rollDice} 
              disabled={isRolling || !isMyTurn}
            >
              Бросить кубик
            </button>
          )}
        </div>
      </div>
    </PageContainer>
  );
} 