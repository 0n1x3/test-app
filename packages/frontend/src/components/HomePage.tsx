'use client';

import { useIsConnectionRestored } from '@tonconnect/ui-react';
import { TonConnectButton } from '@tonconnect/ui-react';
import { ConnectionStatus } from './ConnectionStatus';
import { ContractOperations } from './ContractOperations';
import { useTonConnect } from '@/hooks/useTonConnect';

export function HomePage() {
  const connectionRestored = useIsConnectionRestored();
  const { tonConnectUI } = useTonConnect();

  if (!connectionRestored) {
    return <div>Loading...</div>;
  }

  return (
    <div className="cabinet">
      <div className="cabinet-content">
        <div className="cabinet-header">
          <h1>Test App</h1>
          <TonConnectButton />
        </div>
        {tonConnectUI.connected && (
          <>
            <ConnectionStatus />
            <ContractOperations />
          </>
        )}
      </div>
    </div>
  );
} 