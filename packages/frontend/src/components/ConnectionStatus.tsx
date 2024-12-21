'use client';

import { useTonConnect } from '@/hooks/useTonConnect';
import { useIsConnectionRestored } from '@tonconnect/ui-react';
import { useEffect, useState, useCallback } from 'react';
import { Address } from '@ton/core';
import { useTonClient } from '@/hooks/useTonClient';

export function ConnectionStatus() {
  const { tonConnectUI } = useTonConnect();
  const isConnectionRestored = useIsConnectionRestored();
  const [balance, setBalance] = useState<string>('0');
  const [loading, setLoading] = useState(false);
  const { client } = useTonClient();

  const getContractData = useCallback(async () => {
    if (!tonConnectUI.account?.address || !client) return;
    
    setLoading(true);
    try {
      const address = Address.parse(tonConnectUI.account.address);
      const result = await client.callGetMethod(address, 'get_contract_data');
      const contractBalance = result.stack.readBigNumber();
      setBalance(contractBalance.toString());
    } catch (e) {
      console.error('Error fetching contract data:', e);
    } finally {
      setLoading(false);
    }
  }, [tonConnectUI.account?.address, client]);

  useEffect(() => {
    if (tonConnectUI.connected && client) {
      getContractData();
    }
  }, [tonConnectUI.connected, client, getContractData]);

  if (!isConnectionRestored || !tonConnectUI.connected) {
    return null;
  }

  return (
    <div className="wallet-section">
      <div className="wallet-content">
        <div className="token-item">
          <div className="token-info">
            <img src="/icons/ton.png" alt="TON" className="token-icon" />
            <span className="token-symbol">TON</span>
          </div>
          <div className="token-balance">
            <span className={loading ? 'updating' : ''}>
              {Number(balance).toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 