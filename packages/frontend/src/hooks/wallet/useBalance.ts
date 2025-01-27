import { useUserStore } from '@/store/useUserStore';
import { useTonWalletBalance } from './useTonWalletBalance';

// Создать общий хук для баланса
export const useBalance = () => {
  const { balance } = useUserStore();
  const { data: tonBalance } = useTonWalletBalance();
  
  return {
    inGame: balance,
    ton: tonBalance,
    total: balance + (tonBalance || 0)
  };
}; 