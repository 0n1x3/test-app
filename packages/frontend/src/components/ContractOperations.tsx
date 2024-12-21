'use client';

import { useTonConnect } from '@/hooks/useTonConnect';
import { useState } from 'react';
import { Address, beginCell, toNano } from 'ton-core';

export function ContractOperations() {
  const { sender } = useTonConnect();
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDeposit = async () => {
    if (!sender) return;
    
    try {
      setLoading(true);
      await sender.send({
        to: sender.address,
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
    if (!sender || !withdrawAmount) return;
    
    try {
      setLoading(true);
      await sender.send({
        to: sender.address,
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
    <div className="wallet-section">
      <div className="wallet-content">
        <div className="token-list">
          <div className="token-item">
            <button
              onClick={handleDeposit}
              disabled={loading}
              className="check-nft-button"
            >
              Внести TON
            </button>
          </div>
          <div className="token-item">
            <input
              type="number"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="Сумма для вывода"
              className="token-input"
              disabled={loading}
            />
            <button
              onClick={handleWithdraw}
              disabled={loading || !withdrawAmount}
              className="check-nft-button"
            >
              Вывести TON
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 