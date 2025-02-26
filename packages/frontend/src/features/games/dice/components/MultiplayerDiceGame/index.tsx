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

// Упрощенная версия с предотвращением ошибки #185
export function MultiplayerDiceGame({ gameId, betAmount, onGameEnd }: MultiplayerDiceGameProps) {
  // Минимальный набор состояний
  const [gameStatus, setGameStatus] = useState('waiting');
  const currentUser = useUserStore(state => ({ 
    id: state.telegramId || 0,
    name: state.username || 'Вы'
  }));
  
  // Предотвращаем обновления после размонтирования
  const mountedRef = useRef(true);
  const socketRef = useRef<Socket | null>(null);
  
  // Первоначальная настройка - выполняется только при монтировании
  useEffect(() => {
    console.log('MultiplayerDiceGame mounted, gameId:', gameId);
    
    // Явно устанавливаем флаг монтирования
    mountedRef.current = true;
    
    // Очистка при размонтировании
    return () => {
      mountedRef.current = false;
      console.log('MultiplayerDiceGame unmounted');
      
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []); // Пустой массив зависимостей - выполняется только один раз
  
  // Отдельный эффект для подключения к сокету - запускается при изменении gameId
  // Этот паттерн разделения эффектов помогает избежать циклов обновления
  useEffect(() => {
    if (!mountedRef.current) return;
    
    // Функция для безопасного подключения к сокету
    const connectToSocket = () => {
      if (!mountedRef.current) return;
      
      // Отключаем старый сокет, если он существует
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      
      // Устанавливаем новое соединение
      try {
        console.log('Attempting to connect to socket, gameId:', gameId);
        
        const newSocket = io('https://test.timecommunity.xyz', {
          path: '/socket.io',
          auth: {
            gameId,
            telegramId: currentUser.id
          }
        });
        
        // Сохраняем референцию на сокет
        socketRef.current = newSocket;
        
        // Настраиваем обработчики событий
        newSocket.on('connect', () => {
          if (!mountedRef.current) return;
          console.log('Socket connected');
          
          // Только если компонент смонтирован, присоединяемся к комнате
          setTimeout(() => {
            if (mountedRef.current && socketRef.current) {
              socketRef.current.emit('joinGameRoom', { gameId });
            }
          }, 100);
        });
        
        // Обработчик отключения
        newSocket.on('disconnect', () => {
          console.log('Socket disconnected');
        });
        
        // Минимальная обработка состояния игры
        newSocket.on('gameState', (data) => {
          if (!mountedRef.current) return;
          console.log('Received game state:', data);
        });
        
      } catch (error) {
        console.error('Error connecting to socket:', error);
      }
    };
    
    // Используем setTimeout, чтобы гарантировать асинхронное выполнение
    // Это поможет избежать циклов обновления
    const timer = setTimeout(() => {
      connectToSocket();
    }, 100);
    
    return () => {
      clearTimeout(timer);
    };
  }, [gameId, currentUser.id]);
  
  // Функция для копирования ссылки-приглашения
  const copyInviteLink = () => {
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