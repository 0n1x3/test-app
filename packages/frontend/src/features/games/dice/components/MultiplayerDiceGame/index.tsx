'use client';

import React from 'react';
import { useEffect, useState, useRef, useCallback } from 'react';
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

// React.memo для предотвращения лишних ререндеров
export const MultiplayerDiceGame = React.memo(function MultiplayerDiceGame({ 
  gameId, 
  betAmount, 
  onGameEnd 
}: {
  gameId: string;
  betAmount: number;
  onGameEnd: (result: 'win' | 'lose' | 'draw') => void;
}) {
  // Локальное состояние компонента
  const [gameStatus, setGameStatus] = useState('waiting');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  
  // Получаем только необходимые данные из хранилища
  const currentUser = useUserStore(state => ({
    id: state.telegramId || 0,
    name: state.username || 'Вы'
  }));
  
  // Refs для предотвращения утечек памяти
  const mountedRef = useRef(true);
  const socketRef = useRef<Socket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  
  // Мемоизированный обработчик для предотвращения лишних пересозданий
  const copyInviteLink = useCallback(() => {
    const link = `https://t.me/neometria_bot?startapp=game_${gameId}`;
    navigator.clipboard.writeText(link)
      .then(() => {
        if (mountedRef.current) {
          window.Telegram?.WebApp?.showPopup({
            title: 'Успех',
            message: 'Ссылка скопирована в буфер обмена',
            buttons: [{ type: 'ok' }]
          });
        }
      })
      .catch(error => {
        console.error('Ошибка копирования:', error);
      });
  }, [gameId]);

  // Установка начального состояния и очистка при размонтировании
  useEffect(() => {
    console.log('MultiplayerDiceGame mounted with gameId:', gameId);
    mountedRef.current = true;
    
    return () => {
      console.log('MultiplayerDiceGame unmounted');
      mountedRef.current = false;
      
      if (socketRef.current) {
        console.log('Disconnecting socket on unmount');
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  // Отдельный эффект для подключения сокета
  useEffect(() => {
    // Функция для подключения к сокету
    const connectToSocket = () => {
      if (!mountedRef.current) return;
      if (isConnecting) return;
      
      setIsConnecting(true);
      
      // Отключаем предыдущий сокет, если он существует
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      
      try {
        console.log('Connecting to socket, gameId:', gameId);
        
        const socket = io('https://test.timecommunity.xyz', {
          path: '/socket.io',
          auth: {
            gameId,
            telegramId: currentUser.id
          },
          reconnectionAttempts: 3,
          timeout: 10000
        });
        
        socketRef.current = socket;
        
        // Обработчики событий сокета
        socket.on('connect', () => {
          if (!mountedRef.current) return;
          
          console.log('Socket connected, socket id:', socket.id);
          setErrorMessage(null);
          reconnectAttemptsRef.current = 0;
          setIsConnecting(false);
          
          // Присоединяемся к комнате игры
          socket.emit('joinGameRoom', { gameId });
        });
        
        socket.on('connect_error', (error) => {
          if (!mountedRef.current) return;
          
          console.error('Socket connection error:', error);
          setErrorMessage('Ошибка подключения к серверу');
          setIsConnecting(false);
          
          reconnectAttemptsRef.current += 1;
          if (reconnectAttemptsRef.current < 3) {
            setTimeout(connectToSocket, 2000);
          }
        });
        
        socket.on('disconnect', (reason) => {
          if (!mountedRef.current) return;
          
          console.log('Socket disconnected:', reason);
          setIsConnecting(false);
          
          if (reason === 'io server disconnect') {
            // Сервер разорвал соединение
            setErrorMessage('Сервер разорвал соединение');
          } else if (reason === 'transport close') {
            // Соединение потеряно, пробуем переподключиться
            setTimeout(connectToSocket, 1000);
          }
        });
        
        // Минимальная обработка игровых событий
        socket.on('gameState', (data) => {
          if (!mountedRef.current) return;
          
          console.log('Received game state:', data);
          // Обновляем состояние только если оно изменилось
          if (data.status && data.status !== gameStatus) {
            setGameStatus(data.status);
          }
        });
        
      } catch (error) {
        console.error('Error creating socket:', error);
        setErrorMessage('Ошибка при создании соединения');
        setIsConnecting(false);
      }
    };
    
    // Запускаем подключение с небольшой задержкой
    const timerId = setTimeout(connectToSocket, 300);
    
    return () => {
      clearTimeout(timerId);
    };
  }, [gameId, currentUser.id]);

  // Если есть ошибка, показываем сообщение об ошибке
  if (errorMessage) {
    return (
      <div className="multiplayer-dice-game error-state">
        <div className="error-message">
          <h3>Ошибка</h3>
          <p>{errorMessage}</p>
          <button 
            className="retry-button"
            onClick={() => {
              setErrorMessage(null);
              reconnectAttemptsRef.current = 0;
              // Пробуем переподключиться после клика
              if (socketRef.current) {
                socketRef.current.connect();
              }
            }}
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  // Упрощенный рендер для экрана ожидания
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
}); 