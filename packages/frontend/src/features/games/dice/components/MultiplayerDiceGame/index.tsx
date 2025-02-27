'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { Icon } from '@iconify/react';
import { useUserStore } from '@/store/useUserStore';
import { Dice } from '../Dice';
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
  
  // Сохраняем инстанс socket в ref, а не в state
  const initSocket = useCallback(() => {
    // Если сокет уже существует, не создаем новый
    if (socketRef.current) return;
    
    try {
      const socket = io();
      socketRef.current = socket;
      
      socket.on('connect', () => {
        if (!mountedRef.current) return;
        console.log('Socket connected');
        
        // Присоединяемся к игре только после установки соединения
        socket.emit('joinGame', { gameId });
      });
      
      socket.on('gameState', (data) => {
        if (!mountedRef.current) return;
        console.log('Game state update:', data);
        
        setGameState(data);
        
        if (data.status === 'finished' && data.result) {
          // Задержка перед вызовом onGameEnd
          setTimeout(() => {
            if (mountedRef.current && onGameEnd) {
              onGameEnd(data.result);
            }
          }, 2000);
        }
      });
      
      socket.on('error', (error) => {
        if (!mountedRef.current) return;
        console.error('Socket error:', error);
      });
      
      socket.on('disconnect', () => {
        if (!mountedRef.current) return;
        console.log('Socket disconnected');
      });
    } catch (error) {
      console.error('Error initializing socket:', error);
    }
  }, [gameId, onGameEnd]);
  
  useEffect(() => {
    console.log('MultiplayerDiceGame mounted with gameId:', gameId);
    mountedRef.current = true;
    
    // Инициализируем сокет при монтировании
    initSocket();
    
    // Очистка при размонтировании
    return () => {
      console.log('MultiplayerDiceGame unmounted');
      mountedRef.current = false;
      
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [gameId, initSocket]);
  
  const rollDice = useCallback(() => {
    if (!socketRef.current) return;
    
    socketRef.current.emit('rollDice', { gameId });
  }, [gameId]);
  
  const copyInviteLink = useCallback(() => {
    try {
      const link = `https://t.me/neometria_bot?startapp=game_${gameId}`;
      navigator.clipboard.writeText(link);
      
      window.Telegram?.WebApp?.showPopup({
        title: 'Успех',
        message: 'Ссылка скопирована в буфер обмена',
        buttons: [{ type: 'ok' }]
      });
    } catch (error) {
      console.error('Ошибка копирования ссылки:', error);
    }
  }, [gameId]);
  
  // Основной рендеринг
  if (gameState.status === 'waiting') {
    return (
      <div className="multiplayer-dice-game">
        <div className="game-header">
          <div className="score">
            <div className="round-number">Игра #{gameId.slice(-4)}</div>
            <div className="bet-amount">
              <Icon icon="material-symbols:diamond-rounded" />
              {betAmount}
            </div>
          </div>
        </div>

        <div className="game-area">
          <div className="waiting-message">
            <h3>Ожидание соперника</h3>
            <p>Пригласите друга, чтобы начать игру</p>
            <div className="share-link">
              <button 
                className="copy-invite-button"
                onClick={copyInviteLink}
              >
                <Icon icon="material-symbols:content-copy" />
                Скопировать ссылку-приглашение
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Игровой процесс
  return (
    <div className="multiplayer-dice-game">
      <div className="game-header">
        <div className="score">
          <div className="round-number">Игра #{gameId.slice(-4)}</div>
          <div className="bet-amount">
            <Icon icon="material-symbols:diamond-rounded" />
            {betAmount}
          </div>
        </div>
      </div>

      <div className="game-area">
        {gameState.players.map((player, index) => (
          <div 
            key={player.telegramId || index}
            className={`player-area ${
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
    </div>
  );
} 