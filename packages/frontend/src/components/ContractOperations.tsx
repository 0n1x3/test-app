'use client';

import { useTonConnect } from '@/hooks/useTonConnect';
import { useState } from 'react';
import { beginCell, toNano, Address } from '@ton/core';
import { formatTonAmount } from '@/utils/format';
import { isTelegramWebAppAvailable } from '@/utils/telegram';

export function ContractOperations() {
  const { sender } = useTonConnect();
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isTelegram = isTelegramWebAppAvailable();

  const handleDeposit = async () => {
    if (!sender || !sender.address) return;
    setError(null);
    
    try {
      setLoading(true);
      const address = sender.address as Address;
      await sender.send({
        to: address,
        value: toNano('0.1'),
        body: beginCell().endCell(),
      });
    } catch (e) {
      console.error('Error making deposit:', e);
      setError('Ошибка при внесении TON');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!sender || !sender.address || !withdrawAmount) return;
    setError(null);
    
    try {
      setLoading(true);
      const address = sender.address as Address;
      await sender.send({
        to: address,
        value: toNano('0.1'),
        body: beginCell()
          .storeUint(1, 32)
          .storeCoins(toNano(withdrawAmount))
          .endCell(),
      });
    } catch (e) {
      console.error('Error withdrawing:', e);
      setError('Ошибка при выводе TON');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`operations-section ${isTelegram ? 'telegram-app' : ''}`}>
      <div className="operations-content">
        {error && <div className="error-message">{error}</div>}
        <button
          onClick={handleDeposit}
          disabled={loading || !sender || !sender.address}
          className="operation-button"
        >
          {loading ? 'Загрузка...' : 'Внести TON'}
        </button>
        <div className="withdraw-container">
          <input
            type="number"
            value={withdrawAmount}
            onChange={(e) => {
              const value = e.target.value;
              if (!isNaN(Number(value)) && Number(value) >= 0) {
                setWithdrawAmount(value);
              }
            }}
            placeholder="Сумма для вывода"
            className="withdraw-input"
            disabled={loading}
          />
          <div className="amount-preview">
            {withdrawAmount && `≈ ${formatTonAmount(Number(withdrawAmount))} TON`}
          </div>
          <button
            onClick={handleWithdraw}
            disabled={loading || !withdrawAmount || !sender || !sender.address}
            className="operation-button"
          >
            {loading ? 'Загрузка...' : 'Вывести TON'}
          </button>
        </div>
      </div>
    </div>
  );
} 