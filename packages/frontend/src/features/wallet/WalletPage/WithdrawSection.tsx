'use client';

import { useState } from 'react';
import { useTonConnect } from '@/hooks/wallet/useTonConnect';
import { useTestContract } from '@/hooks/wallet/useTestContract';

export function WithdrawSection() {
  const { sender } = useTonConnect();
  const { contractBalance } = useTestContract();
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');

  const availableBalance = Number(contractBalance || 0) / 1e9;
  const minWithdraw = 2;

  return (
    <div className="withdraw-section">
      <div className="warning-box">
        <span className="warning-icon">⚠️</span>
        <p>
          Withdrawals are made only to an external TON wallet. 
          Do not attempt to withdraw funds to your exchange platform account.
        </p>
      </div>

      <div className="form-group">
        <div className="label">Address</div>
        <div className="input-container">
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter address"
            className="input-field"
          />
          <button className="paste-button">Paste</button>
        </div>
      </div>

      <div className="form-group">
        <div className="label">Amount</div>
        <div className="input-container">
          <input
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="input-field"
          />
          <span className="currency">TON</span>
          <button className="max-button">Max</button>
        </div>
      </div>

      <div className="info-container">
        <span>Minimum {minWithdraw} TON</span>
        <span>Available {availableBalance.toFixed(2)} TON</span>
      </div>

      <button 
        className="submit-button"
        disabled={!sender || !address || !amount}
      >
        Next
      </button>
    </div>
  );
} 