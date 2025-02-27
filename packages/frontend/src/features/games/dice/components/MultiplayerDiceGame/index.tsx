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

  // Состояния кубиков
  const [playerDice, setPlayerDice] = useState<number>(1);
  const [opponentDice, setOpponentDice] = useState<number>(1);
  const [isRolling, setIsRolling] = useState(false);
  
  // Данные пользователя
  const telegramId = useUserStore(state => state.telegramId);
  
  // Ссылка на WebSocket соединение
  const socketRef = useRef<Socket | null>(null);
  
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
  
  // Подключение к WebSocket при монтировании компонента
  useEffect(() => {
    // Инициализация socket.io соединения
    socketRef.current = io('https://test.timecommunity.xyz', {
      transports: ['websocket'],
      query: { gameId }
    });
    
    console.log('Socket connection initialized');
    
    const socket = socketRef.current;
    
    socket.on('connect', () => {
      console.log('Socket connected');
      setConnectionStatus('connected');
      
      // После подключения присоединяемся к игровой комнате
      socket.emit('joinGameRoom', { gameId });
    });
    
    // Подтверждение присоединения к комнате
    socket.on('joinedGameRoom', (data) => {
      console.log('Joined game room:', data);
      // При присоединении к комнате запрашиваем информацию об игре
      socket.emit('getGame', { gameId });
    });

    // Получаем информацию об игре
    socket.on('gameData', (data) => {
      console.log('Received game data:', data);
      
      // Обновляем список игроков
      if (data.players && data.players.length > 0) {
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
          }
          
          if (opponent) {
            console.log('Opponent data found:', opponent);
            setOpponentData(opponent);
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
      }
      
      // Обновляем статус игры
      if (data.status === 'playing') {
        console.log('Game is now in playing state');
        setGameState('playing');
        
        // Если currentPlayer не определен, первый ход делает создатель игры
        const userId = getUserId();
        if (userId) {
          setIsMyTurn(data.players[0]?.telegramId === userId);
        } else {
          // Если не удалось получить ID пользователя, предполагаем, что ход не наш
          setIsMyTurn(false);
        }
      }
    });

    // Обновление данных игры
    socket.on('gameStateUpdate', (data) => {
      console.log('Game state update:', data);
      
      if (data.status === 'playing') {
        setGameState('playing');
      }
      
      if (data.currentPlayer) {
        const isCurrentPlayerTurn = playerData && playerData.id === data.currentPlayer;
        setIsMyTurn(isCurrentPlayerTurn);
      }
      
      // Обновляем данные кубиков, если они есть
      if (data.lastMove) {
        const { playerId, value } = data.lastMove;
        
        if (playerData && playerId === playerData.id) {
          setPlayerDice(value);
        } else {
          setOpponentDice(value);
        }
      }
      
      // Обновляем раунд
      if (data.currentRound) {
        setRound(data.currentRound);
      }
      
      // Проверяем, завершена ли игра
      if (data.status === 'finished' && data.result) {
        setGameState('finished');
        setGameResult(data.result);
        onGameEnd(data.result);
      }
    });

    // Обрабатываем событие присоединения игрока
    socket.on('playerJoined', (data) => {
      console.log('Player joined:', data);
      
      // Запрашиваем обновленные данные игры
      socket.emit('getGame', { gameId });
      
      // Показываем уведомление
      toast.success(`Игрок ${data.player.username} присоединился к игре!`);
    });

    // Обработка события начала игры
    socket.on('gameStarted', (data) => {
      console.log('Game started event received:', data);
      setGameState('playing');
      
      // Если currentPlayer не определен, первый ход делает создатель игры
      const userId = getUserId();
      if (userId) {
        setIsMyTurn(data.players[0]?.telegramId === userId);
      } else {
        // Если не удалось получить ID пользователя, предполагаем, что ход не наш
        setIsMyTurn(false);
      }
    });

    // Обработка ошибок
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
    });

    // Отключаем сокет при размонтировании компонента
    return () => {
      console.log('Disconnecting socket');
      if (socket) {
        socket.disconnect();
      }
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
    if (!isMyTurn || isRolling || gameState !== 'playing') return;
    
    setIsRolling(true);
    
    // Эмулируем бросок кубика
    setTimeout(() => {
      const userId = getUserId();
      
      if (socketRef.current && userId && playerData) {
        // Отправляем ход на сервер
        socketRef.current.emit('diceMove', { 
          gameId, 
          value: Math.floor(Math.random() * 6) + 1,
          userId
        });
      } else {
        console.error('Не удалось отправить ход: отсутствуют данные пользователя или подключение');
        toast.error('Не удалось выполнить ход. Проверьте подключение.');
        setIsRolling(false);
      }
      
      setIsMyTurn(false);
    }, 1500);
  };

  // Функция для копирования пригласительной ссылки
  const copyInviteLink = () => {
    const inviteLink = `https://t.me/neometria_bot?startapp=game_${gameId}`;
    
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
            onClick={() => window.location.reload()}
          >
            Перезагрузить
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