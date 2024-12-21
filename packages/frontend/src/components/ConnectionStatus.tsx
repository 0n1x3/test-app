'use client';

import { useTonConnect } from '@/hooks/useTonConnect';
import { useIsConnectionRestored } from '@tonconnect/ui-react';
import { useEffect, useState, useCallback } from 'react';
import { Address } from '@ton/core';
import { useTonClient } from '@/hooks/useTonClient';
import { formatTonAmount } from '@/utils/format';
import { useTestContract } from '@/hooks/useTestContract';

export function ConnectionStatus() {
  const { contractBalance } = useTestContract();
  const { tonConnectUI } = useTonConnect();
  const isConnectionRestored = useIsConnectionRestored();
  const [loading, setLoading] = useState(false);

  if (!isConnectionRestored || !tonConnectUI.connected) {
    return null;
  }

  return (
    <div className="wallet-section">
      <div className="wallet-content">
        <div className="token-item">
          <div className="token-info">
            <img src="/ton-logo.svg" alt="TON" className="token-icon" />
            <span className="token-symbol">TON</span>
          </div>
          <div className="token-balance">
            <span className={loading ? 'updating' : ''}>
              {formatTonAmount(Number(contractBalance || 0))}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 