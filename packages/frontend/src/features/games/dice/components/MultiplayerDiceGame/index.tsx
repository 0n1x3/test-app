'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { Icon } from '@iconify/react';
import { useUserStore } from '@/store/useUserStore';
import { Dice } from '../Dice';
import { toast } from 'react-hot-toast';
import { getUserId, getOrCreateGuestId } from '@/utils/telegramWebApp';
import './style.css';

// Удаляем объявление глобального интерфейса, так как оно определено в global.d.ts

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
  const [userId, setUserId] = useState<string | null>(null);

  // Состояния кубиков
  const [playerDice, setPlayerDice] = useState<number>(1);
  const [opponentDice, setOpponentDice] = useState<number>(1);
  const [isRolling, setIsRolling] = useState(false);
  
  // Данные пользователя
  const telegramId = useUserStore(state => state.telegramId);
  
  // Ссылка на WebSocket соединение
  const socketRef = useRef<Socket | null>(null);
  const connectionAttemptRef = useRef(0);
  
  // Функция для получения ID пользователя
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
  const setupSocketConnection = useCallback(() => {
    try {
      if (socketRef.current) {
        console.log('Закрытие существующего соединения перед повторным подключением');
        socketRef.current.close();
      }

      const userId = getTelegramUserId();
      // Получаем уникальный идентификатор пользователя или создаем гостевой
      const userIdForSocket = userId ? userId.toString() : getOrCreateGuestId();
      console.log('Подключение к WebSocket с ID:', userIdForSocket);
      
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
        userId: userIdForSocket,
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
          userId: userIdForSocket,
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
      const userId = getTelegramUserId();
      
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
            <Icon icon="mdi:coins" />
            {betAmount}
          </div>
        </div>
        
        {connectionStatus !== 'connected' ? (
          <div className="connecting-container">
            <div className="loading-spinner"></div>
            <p>Подключение к игре...</p>
            {socketError && (
              <div className="error-container">
                <p>{socketError}</p>
                <button className="reload-button" onClick={setupSocketConnection}>
                  Повторить подключение
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="waiting-container">
            <h2>Ожидание соперника</h2>
            <p>Поделитесь ссылкой с другом или дождитесь пока кто-то присоединится</p>
            
            <button className="copy-invite-button" onClick={copyInviteLink}>
              <Icon icon="mdi:content-copy" />
              Скопировать ссылку
            </button>
            
            <div className="connected-players">
              <h3>Подключенные игроки ({players.length}/2):</h3>
              {players.length > 0 ? (
                players.map((player, index) => {
                  const isCurrentUser = player.telegramId && userId && 
                    player.telegramId.toString() === userId.toString();
                  return (
                    <div key={index} className="player-item">
                      {player.username || `Игрок ${index + 1}`}
                      {isCurrentUser && " (вы)"}
                    </div>
                  );
                })
              ) : (
                <div className="player-item">
                  Ожидание подключения игроков...
                </div>
              )}
            </div>
          </div>
        )}
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

  // Обновляем возвращаемый JSX для лучшей интеграции с макетом
  return (
    <div className="multiplayer-dice-game">
      {/* Отображение статуса подключения */}
      {connectionStatus !== 'connected' && (
        <div className="connection-status">
          <div className={`status-indicator ${connectionStatus}`}>
            {connectionStatus === 'connecting' && 'Подключение...'}
            {connectionStatus === 'error' && (socketError || 'Ошибка подключения')}
          </div>
        </div>
      )}
      
      {/* Отображение игрового поля, если данные игры получены */}
      {playerData && (
        <div className="game-container">
          <div className="game-info">
            <h2>Раунд {round}/3</h2>
            <div className="bet-amount">
              <Icon icon="solar:diamond-bold" />
              <span>{betAmount}</span>
            </div>
          </div>
          
          <div className="players-container">
            <div className="player-side">
              <div className="dice-container">
                <Dice value={playerDice} rolling={isRolling && isMyTurn} />
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
                <div className="player-score">
                  {playerData?.score || 0}
                </div>
              </div>
            </div>
            
            <div className="vs-badge">VS</div>
            
            <div className="player-side opponent">
              <div className="dice-container">
                <Dice value={opponentDice} rolling={isRolling && !isMyTurn} />
              </div>
              
              <div className="player-info">
                <div className="player-avatar">
                  {opponentData?.avatarUrl ? (
                    <img src={opponentData.avatarUrl} alt="avatar" />
                  ) : (
                    <Icon icon="material-symbols:skull-outline" style={{ color: '#ff4757' }} />
                  )}
                </div>
                <div className="player-name">
                  {opponentData?.username || 'Соперник'}
                </div>
                <div className="player-score">
                  {opponentData?.score || 0}
                </div>
              </div>
            </div>
          </div>
          
          {/* Кнопка для броска кубика */}
          {gameState === 'playing' && isMyTurn && !isRolling && (
            <button 
              className="roll-button" 
              onClick={rollDice}
              disabled={isRolling || !isMyTurn}
            >
              Бросить кубик
            </button>
          )}
          
          {/* Ожидание хода соперника */}
          {gameState === 'playing' && !isMyTurn && !isRolling && (
            <div className="waiting-message">
              <p>Ожидание хода соперника...</p>
            </div>
          )}
          
          {/* Ожидание присоединения второго игрока */}
          {gameState === 'waiting' && (
            <div className="waiting-message">
              <p>Ожидание второго игрока...</p>
              <button className="invite-button" onClick={copyInviteLink}>
                <Icon icon="mdi:share" />
                Пригласить друга
              </button>
            </div>
          )}
          
          {/* Результат игры */}
          {gameResult && (
            <div className={`game-result ${gameResult}`}>
              <h2>
                {gameResult === 'win' && 'Вы победили!'}
                {gameResult === 'lose' && 'Вы проиграли!'}
                {gameResult === 'draw' && 'Ничья!'}
              </h2>
            </div>
          )}
        </div>
      )}
    </div>
  );
  
  // Запасной вариант, хотя сюда мы не должны попадать
  return (
    <div className="multiplayer-dice-game">
      <div className="game-info">
        <h2>Загрузка игры...</h2>
      </div>
    </div>
  );
} 