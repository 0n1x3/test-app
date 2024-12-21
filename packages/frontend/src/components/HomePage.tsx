'use client';

import { useIsConnectionRestored } from '@tonconnect/ui-react';
import { TonConnectButton } from '@tonconnect/ui-react';
import { ConnectionStatus } from './ConnectionStatus';
import { ContractOperations } from './ContractOperations';
import { useTonConnect } from '@/hooks/useTonConnect';

export function HomePage() {
  const connectionRestored = useIsConnectionRestored();
  const { tonConnectUI } = useTonConnect();

  const formatAddress = (address: string) => {
    if (!address) return '';
    const prefix = address.slice(0, 4);
    const suffix = address.slice(-4);
    return `${prefix}...${suffix}`;
  };

  if (!connectionRestored) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <main style={{ 
      backgroundColor: '#000000',
      margin: 0,
      padding: 0,
      minHeight: '100vh',
      width: '100vw'
    }}>
      <div className="app">
        <div className="wallet-container">
          {!tonConnectUI.connected ? (
            <div className="connect-section">
              <TonConnectButton />
              <div className="connection-status">Не подключен</div>
            </div>
          ) : (
            <>
              <div className="wallet-address">
                {formatAddress(tonConnectUI.account?.address || '')}
              </div>
              <ConnectionStatus />
              <ContractOperations />
            </>
          )}
        </div>
      </div>
    </main>
  );
} 