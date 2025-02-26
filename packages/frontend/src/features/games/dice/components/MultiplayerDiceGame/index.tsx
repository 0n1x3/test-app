'use client';

import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Icon } from '@iconify/react';
import { useUserStore } from '@/store/useUserStore';
import { Dice } from '../Dice';
import './style.css';

type GameResult = 'win' | 'lose' | 'draw';

// Минимальный набор типов
interface GameStateData {
  players: Array<{
    telegramId: number;
    username?: string;
    avatarUrl?: string;
  }>;
  status: 'waiting' | 'playing' | 'finished';
}

interface MultiplayerDiceGameProps {
  gameId: string;
  betAmount: number;
  onGameEnd: (result: GameResult) => void;
}

// Упрощенная версия компонента
export function MultiplayerDiceGame({ gameId, betAmount, onGameEnd }: MultiplayerDiceGameProps) {
  // Минимальный набор состояний
  const [gameStatus, setGameStatus] = useState<'waiting' | 'ready' | 'playing' | 'finished'>('waiting');
  const [opponent, setOpponent] = useState({ name: 'Противник', avatar: '/avatars/nft5.png' });
  
  // Референция для сокета
  const socketRef = useRef<Socket | null>(null);
  const currentUser = useUserStore(state => ({ 
    id: state.telegramId || 0,
    name: state.username || 'Вы',
    avatar: state.avatarUrl || '/avatars/nft1.png'
  }));

  // Упрощенный эффект для подключения к сокету
  useEffect(() => {
    console.log('Connecting to game:', gameId);
    
    // Создаем сокет
    const socket = io('https://test.timecommunity.xyz', {
      path: '/socket.io',
      auth: {
        gameId,
        telegramId: currentUser.id
      }
    });
    
    socketRef.current = socket;
    
    // Минимальный набор обработчиков
    socket.on('connect', () => {
      console.log('Socket connected');
      socket.emit('joinGameRoom', { gameId });
    });
    
    // Отключаем сокет при размонтировании
    return () => {
      console.log('Disconnecting socket');
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [currentUser.id, gameId]);

  // Функция для копирования ссылки-приглашения
  const copyInviteLink = () => {
    try {
      const link = `https://t.me/neometria_bot?startapp=game_${gameId}`;
      navigator.clipboard.writeText(link)
        .then(() => {
          window.Telegram?.WebApp?.showPopup({
            title: 'Успех',
            message: 'Ссылка скопирована в буфер обмена',
            buttons: [{ type: 'ok' }]
          });
        })
        .catch(error => {
          console.error('Ошибка копирования:', error);
        });
    } catch (error) {
      console.error('Ошибка при копировании ссылки:', error);
    }
  };

  // Упрощенный рендер
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