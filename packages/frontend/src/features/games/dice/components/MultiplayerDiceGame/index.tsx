'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { Icon } from '@iconify/react';
import { useUserStore } from '@/store/useUserStore';
import { Dice } from '../Dice';
import { toast } from 'react-hot-toast';
import './style.css';

// Интерфейсы для Telegram WebApp
interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

interface TelegramWebAppInitData {
  query_id?: string;
  user?: TelegramUser;
  auth_date?: number;
  hash?: string;
  start_param?: string;
}

// Расширяем глобальный интерфейс Window только для telegramWebAppLoaded
declare global {
  interface Window {
    telegramWebAppLoaded?: boolean;
  }
}

interface MultiplayerDiceGameProps {
  gameId: string;
  betAmount: number;
  onGameEnd: (result: 'win' | 'lose' | 'draw') => void;
}

export function MultiplayerDiceGame({ 
  gameId, 
  betAmount, 
  onGameEnd 
}: MultiplayerDiceGameProps) {
  // Состояния игры
  const [gameState, setGameState] = useState<'waiting' | 'playing' | 'finished'>('waiting');
  const [playerData, setPlayerData] = useState<any>(null);
  const [opponentData, setOpponentData] = useState<any>(null);
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [gameResult, setGameResult] = useState<'win' | 'lose' | 'draw' | null>(null);
  const [round, setRound] = useState(1);
  const [players, setPlayers] = useState<any[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [socketError, setSocketError] = useState<string | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  // Состояния кубиков
  const [playerDice, setPlayerDice] = useState<number>(1);
  const [opponentDice, setOpponentDice] = useState<number>(1);
  const [isRolling, setIsRolling] = useState(false);
  
  // Данные пользователя
  const telegramId = useUserStore(state => state.telegramId);
  
  // Ссылка на WebSocket соединение
  const socketRef = useRef<Socket | null>(null);
  const connectionAttemptRef = useRef(0);
  
  // Получение ID пользователя из Telegram WebApp
  const getUserId = (): number | undefined => {
    try {
      // Безопасное получение ID с проверками на undefined
      const telegramApp = window.Telegram?.WebApp;
      
      if (telegramApp?.initDataUnsafe?.user?.id) {
        return telegramApp.initDataUnsafe.user.id;
      }
      
      console.warn('Не удалось получить Telegram ID пользователя');
      return undefined;
    } catch (error) {
      console.error('Ошибка при получении ID пользователя:', error);
      return undefined;
    }
  };

  // Безопасное создание WebSocket соединения
  const setupSocketConnection = useCallback(() => {
    try {
      // Увеличиваем счетчик попыток
      connectionAttemptRef.current += 1;
      console.log(`Попытка подключения #${connectionAttemptRef.current}`);
      
      // Если уже есть соединение, закрываем его
      if (socketRef.current) {
        console.log('Закрытие существующего соединения перед повторным подключением');
        socketRef.current.disconnect();
      }

      // Создаем новое соединение с дополнительными параметрами
      socketRef.current = io('https://test.timecommunity.xyz', {
        transports: ['websocket'],
        path: '/api/socket.io/',
        query: { 
          gameId: gameId,
          userId: getUserId(),
          timestamp: Date.now()  // Предотвращает кэширование
        },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000
      });
      
      console.log('Socket connection initialized with options', {
        gameId,
        userId: getUserId(),
        attempt: connectionAttemptRef.current
      });
      
      const socket = socketRef.current;
      
      // Основные обработчики событий
      socket.on('connect', () => {
        console.log('Socket connected successfully, socket id:', socket.id);
        setConnectionStatus('connected');
        setSocketError(null);
        
        // Явно присоединяемся к игровой комнате и запрашиваем данные
        console.log('Sending joinGameRoom event for gameId:', gameId);
        socket.emit('joinGameRoom', { gameId });
        
        // Через короткое время запрашиваем данные игры
        setTimeout(() => {
          console.log('Requesting game data for gameId:', gameId);
          socket.emit('getGame', { gameId });
        }, 500);
      });
      
      // Подтверждение присоединения к комнате
      socket.on('joinedGameRoom', (data) => {
        console.log('Joined game room confirmation received:', data);
        
        // Запрашиваем данные игры еще раз для гарантии
        socket.emit('getGame', { gameId });
      });

      // Получаем информацию об игре
      socket.on('gameData', (data) => {
        console.log('Received game data:', data);
        
        if (!data) {
          console.error('Game data is empty');
          return;
        }
        
        // Обновляем статус игры
        if (data.status) {
          console.log('Setting game state to:', data.status);
          setGameState(data.status);
        }
        
        // Обновляем список игроков
        if (data.players && Array.isArray(data.players)) {
          console.log('Setting players:', data.players);
          setPlayers(data.players);
          
          // Определяем текущего пользователя и оппонента
          const userId = getUserId();
          console.log('Current user ID from Telegram:', userId);
          
          // Проверяем наличие userId
          if (userId) {
            const currentPlayer = data.players.find((p: any) => p.telegramId === userId);
            const opponent = data.players.find((p: any) => p.telegramId !== userId);
            
            if (currentPlayer) {
              console.log('Current player data found:', currentPlayer);
              setPlayerData(currentPlayer);
            } else {
              console.warn('Current player not found in data. Available players:', 
                data.players.map((p: any) => ({ id: p.id, telegramId: p.telegramId, username: p.username })));
            }
            
            if (opponent) {
              console.log('Opponent data found:', opponent);
              setOpponentData(opponent);
            } else if (data.players.length === 1) {
              console.log('No opponent yet, waiting for second player to join');
            } else {
              console.warn('Could not identify opponent');
            }
          } else {
            console.warn('Невозможно определить игрока, ID пользователя не найден');
          }
          
          // Если оба игрока присоединились, игра готова к старту
          if (data.players.length === 2 && data.status !== 'playing') {
            console.log('Both players joined, ready to start the game');
            // Инициируем старт игры
            socket.emit('startDiceGame', { gameId });
          }
        } else {
          console.warn('Game data does not contain players array');
        }
      });

      // Обновление данных игры
      socket.on('gameStateUpdate', (data) => {
        console.log('Game state update received:', data);
        
        if (data.status) {
          setGameState(data.status);
        }
        
        // Определяем, чей сейчас ход
        if (data.currentPlayer && playerData) {
          const isCurrentPlayerTurn = playerData.id === data.currentPlayer;
          console.log(`Current player turn: ${isCurrentPlayerTurn ? 'YES' : 'NO'}`);
          setIsMyTurn(isCurrentPlayerTurn);
        }
        
        // Обновляем данные кубиков, если они есть
        if (data.lastMove) {
          const { playerId, value } = data.lastMove;
          
          if (playerData && playerId === playerData.id) {
            console.log('Setting player dice value:', value);
            setPlayerDice(value);
            setIsRolling(false);
          } else {
            console.log('Setting opponent dice value:', value);
            setOpponentDice(value);
          }
        }
        
        // Обновляем раунд
        if (data.currentRound) {
          console.log('Setting round:', data.currentRound);
          setRound(data.currentRound);
        }
        
        // Проверяем, завершена ли игра
        if (data.status === 'finished' && data.result) {
          console.log('Game finished with result:', data.result);
          setGameState('finished');
          setGameResult(data.result);
          
          setTimeout(() => {
            console.log('Calling onGameEnd with result:', data.result);
            onGameEnd(data.result);
          }, 2000);
        }
      });

      // Обрабатываем событие присоединения игрока
      socket.on('playerJoined', (data) => {
        console.log('Player joined event received:', data);
        
        // Запрашиваем обновленные данные игры
        socket.emit('getGame', { gameId });
        
        // Показываем уведомление
        if (data.player?.username) {
          toast.success(`Игрок ${data.player.username} присоединился к игре!`);
        } else {
          toast.success('Второй игрок присоединился к игре!');
        }
      });

      // Обработка события начала игры
      socket.on('gameStarted', (data) => {
        console.log('Game started event received:', data);
        setGameState('playing');
        
        // Определяем, чей первый ход
        if (data.currentPlayer && playerData) {
          setIsMyTurn(data.currentPlayer === playerData.id);
        } else {
          // Если не можем определить по ID, используем позицию в массиве игроков
          const userId = getUserId();
          if (userId && data.players && data.players.length > 0) {
            const playerIndex = data.players.findIndex((p: any) => p.telegramId === userId);
            setIsMyTurn(playerIndex === 0); // Первый игрок ходит первым
          } else {
            // Если не удалось определить, предполагаем что ход не наш
            setIsMyTurn(false);
          }
        }
      });

      // Обработка ошибок
      socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setSocketError(`Ошибка подключения: ${error.message}`);
        setConnectionStatus('error');
        
        // Пытаемся подключиться еще раз
        setReconnectAttempts(prev => prev + 1);
        if (reconnectAttempts < 3) {
          toast.error('Ошибка подключения, пробуем снова...');
          setTimeout(setupSocketConnection, 3000);
        } else {
          toast.error('Не удалось подключиться к серверу после нескольких попыток');
        }
      });

      socket.on('error', (error) => {
        console.error('Socket error:', error);
        setSocketError(error.message || 'Произошла ошибка соединения');
        setConnectionStatus('error');
        toast.error(`Ошибка: ${error.message || 'Что-то пошло не так'}`);
      });

      socket.on('disconnect', () => {
        console.log('Socket disconnected');
        setConnectionStatus('error');
        setSocketError('Соединение с сервером прервано');
        
        // Пытаемся переподключиться автоматически
        if (reconnectAttempts < 3) {
          setTimeout(setupSocketConnection, 3000);
          setReconnectAttempts(prev => prev + 1);
        }
      });
      
    } catch (error) {
      console.error('Error setting up socket connection:', error);
      setConnectionStatus('error');
      setSocketError(`Ошибка при настройке соединения: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      toast.error('Не удалось установить соединение с сервером');
    }
  }, [gameId, reconnectAttempts]);

  // Подключаемся к WebSocket при монтировании компонента
  useEffect(() => {
    console.log('MultiplayerDiceGame component mounted with gameId:', gameId);
    setupSocketConnection();
    
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
  }, [gameId, setupSocketConnection]);

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
    if (!isMyTurn || isRolling || gameState !== 'playing') {
      console.log('Roll dice blocked:', { isMyTurn, isRolling, gameState });
      return;
    }
    
    console.log('Rolling dice...');
    setIsRolling(true);
    
    // Генерируем случайное значение от 1 до 6
    const diceValue = Math.floor(Math.random() * 6) + 1;
    console.log('Generated dice value:', diceValue);
    
    // Эмулируем бросок кубика с задержкой для анимации
    setTimeout(() => {
      const userId = getUserId();
      
      if (socketRef.current && userId && playerData) {
        console.log('Sending dice move:', { gameId, value: diceValue, userId });
        // Отправляем ход на сервер
        socketRef.current.emit('diceMove', { 
          gameId, 
          value: diceValue,
          userId
        });
        
        // Обновляем UI до получения подтверждения от сервера
        setPlayerDice(diceValue);
        setIsMyTurn(false);
      } else {
        console.error('Failed to send move:', { 
          socket: !!socketRef.current, 
          userId: userId, 
          playerData: !!playerData 
        });
        toast.error('Не удалось выполнить ход. Проверьте подключение.');
        setIsRolling(false);
      }
    }, 1500); // Задержка для анимации
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

  // Если есть проблемы с соединением
  if (connectionStatus === 'error') {
    return (
      <div className="multiplayer-dice-game">
        <div className="game-info">
          <h1>Ошибка соединения</h1>
        </div>
        <div className="error-container">
          <p>{socketError || 'Не удалось подключиться к серверу'}</p>
          <button 
            className="reload-button"
            onClick={() => {
              setReconnectAttempts(0);
              setupSocketConnection();
            }}
          >
            Переподключиться
          </button>
        </div>
      </div>
    );
  }

  // Если соединение устанавливается
  if (connectionStatus === 'connecting') {
    return (
      <div className="multiplayer-dice-game">
        <div className="game-info">
          <h1>Подключение к игре</h1>
        </div>
        <div className="connecting-container">
          <div className="loading-spinner"></div>
          <p>Устанавливается соединение с сервером...</p>
        </div>
      </div>
    );
  }

  // Если игра в режиме ожидания
  if (gameState === 'waiting') {
    return (
      <div className="multiplayer-dice-game">
        <div className="game-info">
          <h1>Игра в кости</h1>
          <div className="bet-info">
            <Icon icon="material-symbols:diamond-rounded" />
            <span>{betAmount}</span>
          </div>
        </div>
        
        <div className="waiting-container">
          <h2>Ожидание соперника</h2>
          <p>Поделитесь ссылкой с другом или дождитесь пока кто-то присоединится</p>
          
          <button 
            className="copy-invite-button"
            onClick={copyInviteLink}
          >
            <Icon icon="mdi:content-copy" />
            Скопировать ссылку
          </button>
          
          {/* Отображаем информацию о подключенных игроках */}
          <div className="connected-players">
            <h3>Подключенные игроки ({players.length}/2):</h3>
            {players.map((player, index) => (
              <div key={index} className="player-item">
                {player.username || `Игрок ${index + 1}`}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Если игра в процессе
  if (gameState === 'playing') {
    return (
      <div className="multiplayer-dice-game">
        <div className="game-info">
          <h1>Игра в кости: Раунд {round}</h1>
          <div className="bet-info">
            <Icon icon="material-symbols:diamond-rounded" />
            <span>{betAmount}</span>
          </div>
        </div>
        
        <div className="game-container">
          {/* Оппонент */}
          <div className={`player-container ${!isMyTurn ? 'current-turn' : ''}`}>
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
              <Dice value={opponentDice} rolling={!isMyTurn && isRolling} />
            </div>
          </div>
          
          {/* Разделитель */}
          <div className="vs-indicator">VS</div>
          
          {/* Игрок */}
          <div className={`player-container ${isMyTurn ? 'current-turn' : ''}`}>
            <div className="dice-container">
              <Dice value={playerDice} rolling={isMyTurn && isRolling} />
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
          
          <div className="actions">
            <button 
              className="roll-button"
              disabled={!isMyTurn || isRolling}
              onClick={rollDice}
            >
              {isMyTurn ? 'Бросить кубик' : 'Ожидание хода соперника'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Если игра закончена
  if (gameState === 'finished') {
    return (
      <div className="multiplayer-dice-game">
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
    );
  }

  // Запасной вариант, хотя сюда мы не должны попадать
  return (
    <div className="multiplayer-dice-game">
      <div className="game-info">
        <h1>Загрузка игры...</h1>
      </div>
    </div>
  );
} 