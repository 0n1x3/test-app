'use client';

import { useTonConnect } from '@/hooks/useTonConnect';
import { useIsConnectionRestored } from '@tonconnect/ui-react';
import { useEffect, useState, useCallback } from 'react';
import { Address } from 'ton-core';
import { useTonClient } from '@/hooks/useTonClient';

export function ConnectionStatus() {
  const { tonConnectUI } = useTonConnect();
  const isConnectionRestored = useIsConnectionRestored();
  const [balance, setBalance] = useState<string>('0');
  const [loading, setLoading] = useState(false);
  const client = useTonClient();

  const getContractData = useCallback(async () => {
    if (!tonConnectUI.account?.address) return;
    
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
    if (tonConnectUI.connected) {
      getContractData();
    }
  }, [tonConnectUI.connected, getContractData]);

  if (!isConnectionRestored) {
    return <div className="wallet-section">Восстановление подключения...</div>;
  }
  
  return (
    <div className="wallet-section">
      {tonConnectUI.connected ? (
        <div className="wallet-content">
          <div className="token-list">
            <div className="token-item">
              <div className="token-info">
                <div className="token-details">
                  <span className="token-symbol">TON</span>
                </div>
              </div>
              <div className="token-balance-container">
                <span className={`token-balance ${loading ? 'updating' : 'loaded'}`}>
                  {balance} TON
                </span>
              </div>
            </div>
          </div>
          <button 
            onClick={getContractData}
            className="refresh-button"
            disabled={loading}
          >
            ↻
          </button>
        </div>
      ) : (
        <div className="wallet-content">
          <p>Не подключен</p>
        </div>
      )}
    </div>
  );
} 