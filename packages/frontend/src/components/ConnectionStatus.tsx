'use client';

import { useTonConnect } from '@/hooks/useTonConnect';

export function ConnectionStatus() {
  const { tonConnectUI } = useTonConnect();
  
  return (
    <div className="mt-4 text-sm text-gray-600">
      {tonConnectUI.connected ? (
        <p>Connected: {tonConnectUI.account?.address}</p>
      ) : (
        <p>Not connected</p>
      )}
    </div>
  );
} 