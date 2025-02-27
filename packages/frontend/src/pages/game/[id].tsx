'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { SafeArea } from '@/components/_layout/SafeArea';
import { MultiplayerDiceGame } from '@/features/games/dice/components/MultiplayerDiceGame';
import { ErrorBoundary } from '@/components/_shared/ErrorBoundary';
import { useUserStore } from '@/store/useUserStore';
import './style.css';

export default function GamePage() {
  const router = useRouter();
  const { id } = router.query;
  const [gameData, setGameData] = useState<{ betAmount: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const updateUserBalance = useUserStore(state => state.updateBalance);

  useEffect(() => {
    if (!id) return;
    
    const fetchGameData = async () => {
      try {
        setLoading(true);
        console.log("Получение данных игры с ID:", id);
        
        // Получаем Telegram WebApp - он должен быть доступен к этому моменту
        const tg = window.Telegram?.WebApp;
        
        // Используем полный URL для предотвращения проблем с маршрутизацией
        const response = await fetch(`https://test.timecommunity.xyz/api/games/${id}`);
        
        if (!response.ok) {
          console.error('Ошибка при загрузке игры:', response.status, response.statusText);
          throw new Error(`Ошибка загрузки: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Полученные данные игры:", data);
        
        if (data.success) {
          setGameData(data.game);
          
          // Если пользователь еще не в игре, отправляем запрос на присоединение
          if (tg && data.game.status === 'waiting') {
            const userTelegramId = tg.initDataUnsafe?.user?.id;
            const isPlayerInGame = data.game.players.some(
              (player: any) => player.telegramId === userTelegramId
            );
            
            if (!isPlayerInGame) {
              console.log('Отправка запроса на присоединение к игре:', id);
              try {
                const joinResponse = await fetch(`https://test.timecommunity.xyz/api/games/join`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    gameId: id,
                    initData: tg.initData
                  })
                });
                
                if (!joinResponse.ok) {
                  console.error('Ошибка при присоединении к игре:', joinResponse.status);
                  console.warn('Продолжение без присоединения к игре');
                } else {
                  const joinData = await joinResponse.json();
                  console.log('Успешное присоединение к игре:', joinData);
                }
              } catch (joinErr) {
                console.error('Ошибка при выполнении запроса на присоединение:', joinErr);
                console.warn('Продолжение без присоединения к игре');
              }
            }
          }
        } else {
          setError('Игра не найдена');
        }
      } catch (err) {
        console.error('Ошибка при загрузке данных игры:', err);
        setError('Ошибка при загрузке данных игры');
      } finally {
        setLoading(false);
      }
    };
    
    fetchGameData();
  }, [id]);

  // Обработка завершения игры
  const handleGameEnd = (result: 'win' | 'lose' | 'draw') => {
    if (!gameData) return;
    
    console.log('Игра завершена с результатом:', result);
    
    if (result === 'win') {
      console.log('Начисление выигрыша:', gameData.betAmount * 2);
      updateUserBalance(gameData.betAmount * 2);
    } else if (result === 'draw') {
      console.log('Возврат ставки при ничьей:', gameData.betAmount);
      updateUserBalance(gameData.betAmount);
    }
    
    // Показываем результат некоторое время перед возвратом к списку игр
    setTimeout(() => {
      router.push('/games/dice');
    }, 3000);
  };

  if (loading) {
    return (
      <SafeArea>
        <div className="game-page-loading">
          <div className="loading-spinner"></div>
          <p>Загрузка игры...</p>
        </div>
      </SafeArea>
    );
  }

  if (error || !gameData) {
    return (
      <SafeArea>
        <div className="game-error">
          <h3>{error || 'Ошибка при загрузке игры'}</h3>
          <button 
            className="back-button"
            onClick={() => router.push('/games/dice')}
          >
            Вернуться к играм
          </button>
        </div>
      </SafeArea>
    );
  }

  return (
    <SafeArea>
      <ErrorBoundary>
        <div className="isolated-game-container">
          {typeof id === 'string' && gameData && (
            <MultiplayerDiceGame
              key={`game-${id}`}
              gameId={id}
              betAmount={gameData.betAmount}
              onGameEnd={handleGameEnd}
            />
          )}
        </div>
      </ErrorBoundary>
    </SafeArea>
  );
} 