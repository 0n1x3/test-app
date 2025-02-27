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
  
  // Инициализируем сокет
  const initSocket = useCallback(() => {
    // Если сокет уже существует, не создаем новый
    if (socketRef.current) return;
    
    try {
      const socket = io('https://test.timecommunity.xyz');
      socketRef.current = socket;
      
      socket.on('connect', () => {
        if (!mountedRef.current) return;
        console.log('Socket connected');
        
        // Присоединяемся к комнате игры
        socket.emit('joinGameRoom', { gameId }, (response: any) => {
          console.log('Joined game room:', response);
        });
      });
      
      // Обработка обновлений состояния игры
      socket.on('gameState', (data: any) => {
        if (!mountedRef.current) return;
        console.log('Received game state update:', data);
        setGameState({
          players: data.players || [],
          status: data.status,
          currentPlayer: data.currentPlayer,
          result: data.result,
        });
      });
      
      // Обработка начала игры
      socket.on('diceGameStarted', (data: any) => {
        if (!mountedRef.current) return;
        console.log('Dice game started:', data);
        if (data.gameId === gameId) {
          setGameState(prev => ({
            ...prev,
            status: 'playing',
            currentPlayer: data.firstPlayer,
          }));
        }
      });
      
      socket.on('disconnect', () => {
        console.log('Socket disconnected');
      });
      
    } catch (error) {
      console.error('Error initializing socket:', error);
    }
  }, [gameId]);
  
  // При монтировании компонента
  useEffect(() => {
    console.log('MultiplayerDiceGame mounted with gameId:', gameId);
    mountedRef.current = true;
    
    // Проверяем, есть ли savedGameId в localStorage для присоединения
    const pendingGameId = localStorage.getItem('pendingGameJoin');
    if (pendingGameId === gameId && !hasJoined) {
      // Если это та игра, к которой нужно присоединиться, делаем это
      joinGame();
      localStorage.removeItem('pendingGameJoin');
    }
    
    // Инициализируем сокет
    initSocket();
    
    // При размонтировании компонента
    return () => {
      mountedRef.current = false;
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [gameId, initSocket, joinGame, hasJoined]);
  
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
                  <Dice value={player.roll} isRolling={false} />
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