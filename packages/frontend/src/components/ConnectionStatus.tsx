'use client';

import { useTonConnect } from '@/hooks/useTonConnect';
import { useIsConnectionRestored } from '@tonconnect/ui-react';
import { useTestContract } from '@/hooks/useTestContract';
import { formatTonAmount } from '@/utils/format';

export function ConnectionStatus() {
  const { contractBalance } = useTestContract();
  const { tonConnectUI } = useTonConnect();
  const isConnectionRestored = useIsConnectionRestored();

  if (!isConnectionRestored || !tonConnectUI.connected) {
    return null;
  }

  return (
    <div className="bg-[#1E1E1E] rounded-xl p-6">
      <h2 className="text-xl font-semibold text-gray-400 mb-4">My Balance</h2>
      <div className="flex items-center space-x-4">
        <div className="bg-blue-600 rounded-full p-2">
          <img src="/ton-logo.svg" alt="TON" className="w-8 h-8" />
        </div>
        <div>
          <div className="font-bold text-2xl">
            {formatTonAmount(Number(contractBalance || 0))} TON
          </div>
          <div className="text-sm text-gray-400">≈ $0.00 USD</div>
        </div>
      </div>
    </div>
  );
} 