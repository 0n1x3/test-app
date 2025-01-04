'use client';

import { useTonConnect } from '@/hooks/wallet/useTonConnect';
import { useIsConnectionRestored } from '@tonconnect/ui-react';
import { useTestContract } from '@/hooks/wallet/useTestContract';
import { formatTonAmount } from '@/utils/format';

export function ConnectionStatus() {
  const { sender } = useTonConnect();
  const isConnectionRestored = useIsConnectionRestored();
  const { balance } = useTestContract();

  if (!isConnectionRestored) {
    return null;
  }

  return (
    <div className="connection-status">
      {sender ? (
        <div className="balance">
          Balance: {formatTonAmount(Number(balance || 0) / 1e9)} TON
        </div>
      ) : (
        <div className="not-connected">
          Not connected
        </div>
      )}
    </div>
  );
} 