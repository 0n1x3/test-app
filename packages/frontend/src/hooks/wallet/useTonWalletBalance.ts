import { useState, useEffect } from 'react';

export const useTonWalletBalance = () => {
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    // Логика получения баланса
    setBalance(0); // Заглушка
  }, []);

  return { data: balance };
}; 