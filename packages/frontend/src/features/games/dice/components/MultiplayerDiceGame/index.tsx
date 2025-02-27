'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { Icon } from '@iconify/react';
import { useUserStore } from '@/store/useUserStore';
import { Dice } from '../Dice';
import { toast } from 'react-hot-toast';
import './style.css';

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
  // Используем useRef для сохранения ссылки на socket между рендерами
  const socketRef = useRef<Socket | null>(null);
  const mountedRef = useRef(true);
  const [hasJoined, setHasJoined] = useState(false);
  
  // Игровые состояния
  const [gameState, setGameState] = useState<{
    players: any[];
    status: 'waiting' | 'playing' | 'finished';
    currentPlayer?: number;
    result?: 'win' | 'lose' | 'draw';
  }>({
    players: [],
    status: 'waiting',
  });
  
  // Присоединение к игре
  const joinGame = useCallback(async () => {
    try {
      const tg = window.Telegram?.WebApp;
      if (!tg?.initData) {
        toast.error('Ошибка авторизации Telegram');
        return;
      }

      console.log('Присоединяемся к игре:', gameId);
      
      const response = await fetch('https://test.timecommunity.xyz/api/games/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gameId,
          initData: tg.initData
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Ошибка сервера при присоединении к игре:', errorData);
        throw new Error(errorData.message || 'Ошибка сервера');
      }
      
      const data = await response.json();
      
      if (data.success) {
        console.log('Успешно присоединились к игре:', data.game);
        setHasJoined(true);
        // Обновляем состояние игры
        if (data.game) {
          setGameState(prev => ({
            ...prev,
            players: data.game.players || [],
            status: data.game.status,
          }));
        }
      } else {
        toast.error('Не удалось присоединиться к игре');
      }
    } catch (error) {
      console.error('Ошибка при присоединении к игре:', error);
      toast.error('Ошибка при присоединении к игре');
    }
  }, [gameId]);
  
  // Обработка событий сокета
  useEffect(() => {
    if (!gameId) return;
    
    // Инициализация сокета
    socketRef.current = io('https://test.timecommunity.xyz', {
      path: '/socket.io',
      auth: {
        token: localStorage.getItem('userToken') || ''
      }
    });
    
    const socket = socketRef.current;
    
    socket.on('connect', () => {
      console.log('Socket connected');
      
      // После соединения присоединяемся к комнате игры
      socket.emit('joinGameRoom', { gameId }, (response: any) => {
        console.log('Joined game room:', response);
      });
    });
    
    // Обработка события готовности игры к старту
    socket.on('gameReadyToStart', async (data: { gameId: string, players: number }) => {
      console.log('Game ready to start:', data);
      
      if (data.gameId === gameId && data.players === 2) {
        // Задержка для обеспечения стабильности UI
        setTimeout(async () => {
          try {
            console.log('Starting game automatically...');
            const response = await fetch(`https://test.timecommunity.xyz/api/games/start`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                gameId,
                initData: window.Telegram?.WebApp?.initData || ''
              })
            });
            
            if (!response.ok) {
              throw new Error('Failed to start game');
            }
            
            console.log('Game started successfully');
          } catch (error) {
            console.error('Error starting game:', error);
            toast.error('Ошибка при запуске игры');
          }
        }, 1000);
      }
    });
    
    // Обновление состояния игры
    socket.on('gameState', (state: any) => {
      console.log('Received game state:', state);
      setGameState(prevState => ({
        ...prevState,
        ...state
      }));
    });
    
    // Начало игры
    socket.on('diceGameStarted', (data: any) => {
      console.log('Dice game started:', data);
      setGameState(prevState => ({
        ...prevState,
        status: 'playing',
        currentPlayer: data.firstPlayer
      }));
    });
    
    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });
    
    socket.on('error', (error: any) => {
      console.error('Socket error:', error);
    });
    
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [gameId]);
  
  // Функция для броска кубика
  const rollDice = () => {
    if (!socketRef.current) return;
    
    socketRef.current.emit('rollDice', { gameId }, (response: any) => {
      if (response.success) {
        console.log('Dice rolled successfully');
      } else {
        console.error('Failed to roll dice:', response.error);
      }
    });
  };
  
  // Функция для копирования ссылки-приглашения
  const copyInviteLink = () => {
    const inviteLink = `https://t.me/neometria_bot?startapp=game_${gameId}`;
    navigator.clipboard.writeText(inviteLink)
      .then(() => {
        toast.success('Ссылка скопирована');
      })
      .catch(err => {
        console.error('Не удалось скопировать ссылку:', err);
      });
  };

  // Определяем размер кубиков в зависимости от размера экрана
  const isMobile = window.innerWidth < 768;
  const diceSize = isMobile ? 'small' : 'large';

  return (
    <div className="multiplayer-dice-game">
      <div className="game-info">
        <h1>Игра #{gameId.slice(-4)}</h1>
        <div className="bet-info">
          Ставка: {betAmount} 
          <Icon icon="material-symbols:diamond-rounded" />
        </div>
      </div>
      
      {gameState.status === 'waiting' && (
        <div className="waiting-container">
          <h2>Ожидание соперника</h2>
          <p>Пригласите друга, чтобы начать игру</p>
          
          <button className="copy-invite-button" onClick={copyInviteLink}>
            <Icon icon="material-symbols:content-copy" />
            Скопировать ссылку-приглашение
          </button>
          
          {!hasJoined && (
            <button className="join-game-button" onClick={joinGame}>
              Присоединиться к игре
            </button>
          )}
        </div>
      )}
      
      {gameState.status === 'playing' && (
        <div className="game-container">
          {gameState.players.map((player, index) => (
            <div 
              key={player.telegramId || index} 
              className={`player-container ${
                gameState.currentPlayer === index ? 'current-turn' : ''
              }`}
            >
              <div className="player-info">
                <div className="player-avatar">
                  {player.avatarUrl && (
                    <img src={player.avatarUrl} alt={player.username || 'Player'} />
                  )}
                </div>
                <div className="player-name">{player.username || `Player ${index + 1}`}</div>
              </div>
              
              <div className="dice-container">
                {player.roll !== undefined ? (
                  <Dice value={player.roll} isRolling={false} size={diceSize} />
                ) : (
                  <div className="empty-dice"></div>
                )}
              </div>
            </div>
          ))}
          
          {gameState.status === 'playing' && 
           gameState.currentPlayer !== undefined && 
           gameState.players[gameState.currentPlayer]?.telegramId === useUserStore.getState().telegramId && (
            <div className="actions">
              <button className="roll-button" onClick={rollDice}>
                Бросить кубик
              </button>
            </div>
          )}
        </div>
      )}
      
      {gameState.status === 'finished' && gameState.result && (
        <div className={`game-result ${gameState.result}`}>
          {gameState.result === 'win' ? (
            <h2>Вы выиграли!</h2>
          ) : gameState.result === 'lose' ? (
            <h2>Вы проиграли!</h2>
          ) : (
            <h2>Ничья!</h2>
          )}
        </div>
      )}
    </div>
  );
} 