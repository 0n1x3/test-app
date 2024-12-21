'use client';

import { useEffect, useState } from 'react';
import { Address } from '@ton/core';
import { useTonClient } from './useTonClient';
import { useTonConnect } from './useTonConnect';
import { TestContract } from '../wrappers/TestContract';
import { CONTRACT_ADDRESS } from '../config';

export function useTestContract() {
  const { client } = useTonClient();
  const { tonConnectUI } = useTonConnect();
  const [balance, setBalance] = useState<string>();
  const [contractBalance, setContractBalance] = useState<string>();

  const contract = new TestContract(Address.parse(CONTRACT_ADDRESS));

  useEffect(() => {
    async function getBalances() {
      if (!client || !tonConnectUI.account?.address) return;
      
      try {
        // Получаем баланс кошелька
        const walletAddress = Address.parse(tonConnectUI.account.address);
        const walletBalance = await client.getBalance(walletAddress);
        setBalance(walletBalance.toString());

        // Получаем баланс контракта
        const contractBalance = await client.getBalance(contract.address);
        setContractBalance(contractBalance.toString());
      } catch (error) {
        console.error('Error fetching balances:', error);
      }
    }

    getBalances();

    // Обновляем балансы каждые 5 секунд
    const interval = setInterval(getBalances, 5000);
    return () => clearInterval(interval);
  }, [client, tonConnectUI.account?.address]);

  return {
    balance,
    contractBalance,
    address: CONTRACT_ADDRESS
  };
} 