import { GameType, GameTransaction } from '@/types/game';

function getTelegramInitData(): { userId: number; initData: string } {
  const tg = window.Telegram?.WebApp;
  
  if (!tg?.initDataUnsafe?.user?.id || !tg?.initData) {
    throw new Error('User not authenticated');
  }

  return {
    userId: tg.initDataUnsafe.user.id,
    initData: tg.initData
  };
}

export async function createBet(amount: number, game: GameType): Promise<GameTransaction> {
  const { userId, initData } = getTelegramInitData();

  const response = await fetch('/api/transactions/bet', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      userId,
      amount, 
      game,
      initData
    })
  });
  
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error);
  }
  return data.transaction;
}

export async function processGameResult(
  game: GameType,
  result: 'win' | 'lose',
  betAmount: number
): Promise<void> {
  const { userId, initData } = getTelegramInitData();

  const response = await fetch('/api/transactions/result', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      userId,
      game, 
      result, 
      betAmount,
      initData
    })
  });
  
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error);
  }
} 