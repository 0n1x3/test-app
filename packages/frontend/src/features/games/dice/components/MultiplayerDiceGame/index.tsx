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
  
  /**
   * Получает ID пользователя из Telegram WebApp
   * Добавлена расширенная обработка ошибок и логирование
   */
  const getUserId = (): number | undefined => {
    try {
      // Проверяем загрузку Telegram WebApp
      if (window.telegramWebAppLoaded !== true) {
        console.warn('Telegram WebApp еще не загружен');
        return undefined;
      }
      
      // Проверяем наличие необходимых объектов и данных
      if (!window.Telegram || !window.Telegram.WebApp) {
        console.warn('Telegram WebApp не найден, хотя отмечен как загруженный');
        return undefined;
      }
      
      // Проверка initDataUnsafe
      const webApp = window.Telegram.WebApp;
      if (!webApp.initDataUnsafe) {
        console.warn('Отсутствуют initDataUnsafe в Telegram WebApp');
        return undefined;
      }
      
      // Проверка данных пользователя
      const userData = webApp.initDataUnsafe.user;
      if (!userData) {
        console.warn('Пользовательские данные отсутствуют в Telegram WebApp');
        return undefined;
      }
      
      // Проверка ID пользователя
      if (!userData.id) {
        console.warn('ID пользователя отсутствует в данных Telegram');
        return undefined;
      }
      
      // Успешное получение ID
      console.log('Успешно получен ID пользователя Telegram:', userData.id);
      return userData.id;
    } catch (error) {
      console.error('Ошибка при получении ID пользователя:', error instanceof Error ? error.message : 'Неизвестная ошибка');
      return undefined;
    }
  };

  /**
   * Настраивает WebSocket соединение
   * Адаптировано для работы с исправленным API-путем в Nginx
   */
  const setupSocketConnection = useCallback(() => {
    try {
      if (socketRef.current) {
        console.log('Закрытие существующего соединения перед повторным подключением');
        socketRef.current.close();
      }

      const userId = getUserId();
      console.log('Полученный userId для WebSocket:', userId);
      
      // Ограничиваем количество попыток подключения
      const MAX_ATTEMPTS = 5;
      if (connectionAttemptRef.current >= MAX_ATTEMPTS) {
        console.log(`Достигнут лимит попыток подключения (${MAX_ATTEMPTS}). Пауза 10 секунд.`);
        setConnectionStatus('error');
        setSocketError(`Превышен лимит попыток подключения. Пожалуйста, проверьте подключение к интернету или обновите страницу.`);
        
        // После паузы сбрасываем счетчик и пробуем снова
        setTimeout(() => {
          connectionAttemptRef.current = 0;
          setupSocketConnection();
        }, 10000);
        return;
      }

      connectionAttemptRef.current += 1;
      console.log(`Попытка подключения #${connectionAttemptRef.current}`);

      // Параметры для подключения
      const options = {
        gameId,
        userId: userId || 'guest', // Если userId не определен, используем 'guest'
        attempt: connectionAttemptRef.current
      };

      console.log('Socket connection initialized with options', options);

      // Важно: используем корректный URL, соответствующий конфигурации Nginx
      // Используем HTTP и позволяем io() автоматически перейти на WSS при необходимости
      const socketUrl = `https://test.timecommunity.xyz`;
      console.log('Connecting to socket URL:', socketUrl);
      
      const newSocket = io(socketUrl, {
        path: '/api/socket.io/',
        query: {
          gameId,
          userId: userId || 'guest',
          timestamp: Date.now() // Добавляем метку времени, чтобы избежать кэширования
        },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 1000,
        timeout: 5000,
        forceNew: true // Важно для предотвращения повторного использования существующего соединения
      });

      // Обработка событий
      newSocket.on('connect', () => {
        console.log('Socket connected successfully!');
        setConnectionStatus('connected');
        setSocketError(null);
        
        // Присоединяемся к комнате игры
        console.log('Joining game room:', gameId);
        newSocket.emit('joinGameRoom', { gameId });
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setConnectionStatus('error');
        setSocketError(`Ошибка подключения: ${error.message}. Попытка: ${connectionAttemptRef.current}/${MAX_ATTEMPTS}`);
        
        // Пробуем подключиться снова через увеличивающийся интервал
        setTimeout(() => {
          if (socketRef.current) {
            setupSocketConnection();
          }
        }, 1000 * Math.min(connectionAttemptRef.current, 5)); // Увеличиваем задержку, но не более 5 секунд
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
  }, [gameId, connectionAttemptRef.current, socketRef.current]);

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
              connectionAttemptRef.current = 0;
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