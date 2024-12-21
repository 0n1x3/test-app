'use client';

import { useTonConnect } from '@/hooks/useTonConnect';
import { useState } from 'react';
import { beginCell, toNano, Address } from '@ton/core';

export function ContractOperations() {
  const { sender } = useTonConnect();
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDeposit = async () => {
    if (!sender || !sender.address) return;
    
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
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!sender || !sender.address || !withdrawAmount) return;
    
    try {
      setLoading(true);
      const address = sender.address as Address;
      await sender.send({
        to: address,
        value: toNano('0.1'),
        body: beginCell()
          .storeUint(1, 32) // op = 1 для вывода
          .storeCoins(toNano(withdrawAmount))
          .endCell(),
      });
    } catch (e) {
      console.error('Error withdrawing:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="operations-section">
      <div className="operations-content">
        <button
          onClick={handleDeposit}
          disabled={loading || !sender || !sender.address}
          className="operation-button"
        >
          Внести TON
        </button>
        <div className="withdraw-container">
          <input
            type="number"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            placeholder="Сумма для вывода"
            className="withdraw-input"
            disabled={loading}
          />
          <button
            onClick={handleWithdraw}
            disabled={loading || !withdrawAmount || !sender || !sender.address}
            className="operation-button"
          >
            Вывести TON
          </button>
        </div>
      </div>
    </div>
  );
} 