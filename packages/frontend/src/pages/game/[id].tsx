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
        // Используем полный URL для предотвращения проблем с маршрутизацией
        const response = await fetch(`https://test.timecommunity.xyz/api/games/${id}`);
        
        if (!response.ok) {
          console.error('Ошибка при загрузке игры:', response.status, response.statusText);
          throw new Error(`Ошибка загрузки: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
          setGameData(data.game);
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

  const handleGameEnd = (result: 'win' | 'lose' | 'draw') => {
    if (!gameData) return;
    
    if (result === 'win') {
      updateUserBalance(gameData.betAmount * 2);
    } else if (result === 'draw') {
      updateUserBalance(gameData.betAmount);
    }
    
    router.push('/games/dice');
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
          {typeof id === 'string' && (
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