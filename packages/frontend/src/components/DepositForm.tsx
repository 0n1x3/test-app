'use client';

import { useState } from 'react';
import { useTestContract } from '@/hooks/useTestContract';

export function DepositForm() {
  const [amount, setAmount] = useState('');
  const { balance } = useTestContract();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Здесь можно добавить логику для депозита позже
    console.log('Deposit amount:', amount);
  };

  return (
    <div className="mt-4">
      <p>Balance: {balance}</p>
      <form onSubmit={handleSubmit} className="mt-2">
        <input
          type="text"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
          className="border p-2 mr-2"
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Deposit
        </button>
      </form>
    </div>
  );
} 