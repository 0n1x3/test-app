'use client';

import { useEffect, useState } from 'react';
import { Address } from '@ton/core';
import { useTonClient } from './useTonClient';
import { useTonConnect } from './useTonConnect';

export function useTestContract() {
  const { client } = useTonClient();
  const { tonConnectUI } = useTonConnect();
  const [balance, setBalance] = useState<string>();

  useEffect(() => {
    async function getBalance() {
      if (!client || !tonConnectUI.account?.address) return;
      
      const address = Address.parse(tonConnectUI.account.address);
      const balance = await client.getBalance(address);
      setBalance(balance.toString());
    }

    getBalance();
  }, [client, tonConnectUI.account?.address]);

  return {
    balance
  };
} 