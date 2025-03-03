'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { SafeArea } from '@/components/_layout/SafeArea';
import { PageHeader } from '@/components/_layout/PageHeader';
import { PageContainer } from '@/components/_layout/PageContainer';
import { MultiplayerDiceGame } from '@/features/games/dice/components/MultiplayerDiceGame';
import { ErrorBoundary } from '@/components/_shared/ErrorBoundary';
import { useUserStore } from '@/store/useUserStore';
import { toast } from 'react-hot-toast';
import { getTelegramData } from '@/utils/telegramWebApp';
import './style.css';
import io from 'socket.io-client';

// Определим интерфейс для данных игры
interface GameData {
  betAmount: number;
  status?: 'waiting' | 'playing' | 'finished';
  players?: any[];
}

export default function GamePage() {
  const router = useRouter();
  const { id } = router.query;
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joinStatus, setJoinStatus] = useState<'pending' | 'joined' | 'failed' | null>(null);
  
  const updateUserBalance = useUserStore(state => state.updateBalance);

  // Функция для получения данных Telegram WebApp
  const getTelegramUserData = () => {
    try {
      // Используем нашу утилиту для получения данных
      return getTelegramData();
    } catch (error) {
      console.error('Ошибка при получении данных Telegram:', error);
      throw new Error(error instanceof Error ? error.message : 'Неизвестная ошибка при получении данных Telegram');
    }
  };

  // Функция для получения данных игры
  const fetchGameData = async (gameId: string) => {
    try {
      console.log('Запрос данных игры:', gameId);
      setLoading(true);
      
      const response = await fetch(`https://test.timecommunity.xyz/api/games/${gameId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        console.error('Ошибка при загрузке данных игры:', response.status, response.statusText);
        
        // Если игра не найдена
        if (response.status === 404) {
          setError('Игра не найдена');
          return null;
        }
        
        throw new Error(`Ошибка загрузки: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Полученные данные игры:', data);
      
      if (data.success && data.game) {
        return data.game;
      } else {
        setError('Не удалось получить данные игры');
        return null;
      }
    } catch (error) {
      console.error('Ошибка при загрузке данных игры:', error);
      setError(`Ошибка при загрузке данных игры: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Функция для присоединения к игре
  const joinGame = async (gameId: string) => {
    try {
      console.log('Попытка присоединиться к игре:', gameId);
      setJoinStatus('pending');
      
      // Получаем данные Telegram
      let telegramData;
      try {
        telegramData = getTelegramUserData();
      } catch (error) {
        console.error('Не удалось получить данные Telegram для присоединения к игре:', error);
        toast.error('Не удалось получить данные пользователя. Попробуйте перезапустить приложение.');
        setJoinStatus('failed');
        return false;
      }
      
      const response = await fetch('https://test.timecommunity.xyz/api/games/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          gameId,
          initData: telegramData.initData
        })
      });
      
      if (!response.ok) {
        console.error('Ошибка при присоединении к игре:', response.status, response.statusText);
        
        if (response.status === 403) {
          toast.error('Вы не можете присоединиться к этой игре');
          setJoinStatus('failed');
          return false;
        }
        
        toast.error('Не удалось присоединиться к игре');
        setJoinStatus('failed');
        return false;
      }
      
      const data = await response.json();
      console.log('Результат присоединения к игре:', data);
      
      if (data.success) {
        toast.success('Вы присоединились к игре');
        setJoinStatus('joined');
        return true;
      } else {
        toast.error(data.message || 'Не удалось присоединиться к игре');
        setJoinStatus('failed');
        return false;
      }
    } catch (error) {
      console.error('Ошибка при присоединении к игре:', error);
      toast.error(`Ошибка при присоединении к игре: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      setJoinStatus('failed');
      return false;
    }
  };

  // Основной эффект для загрузки данных и присоединения к игре
  useEffect(() => {
    if (!id) return;
    
    const loadGameAndJoin = async () => {
      try {
        // Перестраховка: проверяем, что id - строка
        const gameId = typeof id === 'string' ? id : Array.isArray(id) ? id[0] : null;
        
        if (!gameId) {
          setError('Неверный идентификатор игры');
          return;
        }
        
        // Загружаем данные игры
        const game = await fetchGameData(gameId);
        
        if (!game) {
          console.error('Не удалось загрузить данные игры');
          return;
        }
        
        setGameData(game);
        
        // Если игра ожидает второго игрока, пытаемся присоединиться
        if (game.status === 'waiting') {
          try {
            // Пытаемся получить данные Telegram
            let telegramData;
            try {
              telegramData = getTelegramUserData();
            } catch (telegramError) {
              console.error('Ошибка при получении данных Telegram:', telegramError);
              // Даже если не удалось получить данные, продолжаем с показом игры
              // но не присоединяемся к ней
              return;
            }
            
            const userTelegramId = telegramData.userId;
            
            // Проверяем, есть ли пользователь среди игроков
            const isPlayerInGame = game.players.some(
              (player: any) => player.telegramId === userTelegramId
            );
            
            if (!isPlayerInGame) {
              console.log('Пользователь не в игре, присоединяемся...');
              await joinGame(gameId);
            } else {
              console.log('Пользователь уже в игре');
              setJoinStatus('joined');
            }
          } catch (joinError) {
            console.error('Ошибка при присоединении к игре:', joinError);
            // Продолжаем без присоединения
          }
        }
      } catch (error) {
        console.error('Ошибка при загрузке игры:', error);
        setError(`Произошла ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      }
    };
    
    // Запускаем загрузку игры без проверки на WebApp
    loadGameAndJoin();
  }, [id]);

  // Обработка завершения игры
  const handleGameEnd = (result: 'win' | 'lose' | 'draw') => {
    if (!gameData) return;
    
    console.log('Игра завершена с результатом:', result);
    
    try {
      if (result === 'win') {
        console.log('Начисление выигрыша:', gameData.betAmount * 2);
        updateUserBalance(gameData.betAmount * 2);
        toast.success(`Вы выиграли ${gameData.betAmount * 2} токенов!`);
      } else if (result === 'draw') {
        console.log('Возврат ставки при ничьей:', gameData.betAmount);
        updateUserBalance(gameData.betAmount);
        toast((`Ничья! Ваша ставка ${gameData.betAmount} возвращена.`), {
          icon: '🔄',
        });
      } else {
        toast((`Вы проиграли. Удачи в следующий раз!`), {
          icon: '😢',
        });
      }
      
      // Показываем результат некоторое время перед возвратом к списку игр
      setTimeout(() => {
        router.push('/games/dice');
      }, 3000);
    } catch (error) {
      console.error('Ошибка при обработке результата игры:', error);
    }
  };

  // Если идет загрузка
  if (loading) {
    return (
      <SafeArea>
        <PageContainer>
          <div className="game-page-loading">
            <div className="loading-spinner"></div>
            <p>Загрузка игры...</p>
          </div>
        </PageContainer>
      </SafeArea>
    );
  }

  // Если произошла ошибка
  if (error || !gameData) {
    return (
      <SafeArea>
        <PageContainer>
          <div className="game-error">
            <h3>{error || 'Ошибка при загрузке игры'}</h3>
            <button 
              className="back-button"
              onClick={() => router.push('/games/dice')}
            >
              Вернуться
            </button>
          </div>
        </PageContainer>
      </SafeArea>
    );
  }

  // Если не удалось присоединиться к игре
  if (joinStatus === 'failed') {
    return (
      <SafeArea>
        <div className="game-error">
          <h3>Не удалось присоединиться к игре</h3>
          <p>Возможно, игра уже началась или вы не можете в ней участвовать.</p>
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

  // Если всё в порядке, отображаем игру
  return (
    <SafeArea>
      <PageContainer className="game-page-container">
        <PageHeader title={gameData.status === 'waiting' ? 'Игра в кости' : 'Кубик'} />
        <ErrorBoundary>
          <MultiplayerDiceGame 
            gameId={id as string} 
            betAmount={gameData.betAmount}
            onGameEnd={handleGameEnd}
          />
        </ErrorBoundary>
      </PageContainer>
    </SafeArea>
  );
} 