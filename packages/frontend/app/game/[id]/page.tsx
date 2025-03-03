'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { SafeArea } from '@/components/_layout/SafeArea';
import { PageHeader } from '@/components/_layout/PageHeader';
import { PageContainer } from '@/components/_layout/PageContainer';
import { MultiplayerDiceGame } from '@/features/games/dice/components/MultiplayerDiceGame';
import { ErrorBoundary } from '@/components/_shared/ErrorBoundary';
import { useUserStore } from '@/store/useUserStore';
import { toast } from 'react-hot-toast';
import { getTelegramData } from '@/utils/telegramWebApp';
import { BottomNav } from '@/components/_layout/BottomNav';
import { useTranslation } from '@/providers/i18n';
import './style.css';
import io from 'socket.io-client';

// Определим интерфейс для данных игры
interface GameData {
  betAmount: number;
  status?: 'waiting' | 'playing' | 'finished';
  players?: any[];
  isPlayerInGame: boolean;
}

export default function GamePage() {
  // Получаем параметры из маршрута через хук App Router
  const params = useParams();
  const gameId = params.id as string;
  const { t } = useTranslation();
  
  const router = useRouter();
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
  const fetchGameData = async (id: string) => {
    try {
      console.log('Запрос данных игры:', id);
      setLoading(true);
      
      const response = await fetch(`https://test.timecommunity.xyz/api/games/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        cache: 'no-store' // Отключаем кеширование
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
  const joinGame = async (id: string) => {
    try {
      console.log('Попытка присоединиться к игре:', id);
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
          gameId: id,
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

  // Эффект для загрузки данных игры при монтировании
  useEffect(() => {
    // Функция для загрузки данных и присоединения к игре
    const loadGameAndJoin = async () => {
      try {
        // Загружаем данные игры
        const gameData = await fetchGameData(gameId);
        
        if (!gameData) {
          // Если данные не получены, выходим
          return;
        }
        
        // Сохраняем данные игры
        setGameData(gameData);
        
        // Проверяем, нужно ли присоединяться к игре
        if (!gameData.isPlayerInGame) {
          console.log('Пользователь не в игре, присоединяемся...');
          // Присоединяемся к игре
          await joinGame(gameId);
        } else {
          console.log('Пользователь уже в игре, устанавливаем статус joined');
          setJoinStatus('joined');
        }
      } catch (error) {
        console.error('Ошибка при загрузке игры:', error);
        setError(`Произошла ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      }
    };
    
    // Запускаем загрузку игры
    loadGameAndJoin();
  }, [gameId]);

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

  return (
    <ErrorBoundary>
      <SafeArea>
        <PageContainer>
          <PageHeader title={gameData?.status === 'waiting' ? 'Игра в кости' : 'Кубик'} />
          
          <div className="game-page-wrapper">
            {/* Экран загрузки */}
            {loading && !error && (
              <div className="loading-screen">
                <div className="loading-spinner"></div>
                <p>Загрузка игры...</p>
              </div>
            )}
            
            {/* Экран ошибки */}
            {error && (
              <div className="error-screen">
                <h2>Ошибка загрузки</h2>
                <p>{error}</p>
                <button 
                  className="back-button"
                  onClick={() => router.push('/games/dice')}
                >
                  Вернуться к списку игр
                </button>
              </div>
            )}
            
            {/* Игровой компонент */}
            {!loading && !error && gameData && joinStatus === 'joined' && (
              <div className="isolated-game-container">
                <MultiplayerDiceGame 
                  gameId={gameId}
                  betAmount={gameData.betAmount}
                  onGameEnd={handleGameEnd}
                />
              </div>
            )}
          </div>
          
          <BottomNav />
        </PageContainer>
      </SafeArea>
    </ErrorBoundary>
  );
} 