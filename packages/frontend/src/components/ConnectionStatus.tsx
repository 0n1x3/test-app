'use client';

import { useTonConnect } from '@/hooks/useTonConnect';
import { useIsConnectionRestored } from '@tonconnect/ui-react';
import { useEffect } from 'react';

export function ConnectionStatus() {
  const { tonConnectUI } = useTonConnect();
  const isConnectionRestored = useIsConnectionRestored();

  useEffect(() => {
    console.log('Connection status:', {
      isConnectionRestored,
      connected: tonConnectUI.connected,
      account: tonConnectUI.account
    });
  }, [isConnectionRestored, tonConnectUI.connected, tonConnectUI.account]);

  if (!isConnectionRestored) {
    return <div className="mt-4 text-sm text-gray-600">Восстановление подключения...</div>;
  }
  
  return (
    <div className="mt-4 text-sm text-gray-600">
      {tonConnectUI.connected ? (
        <div>
          <p>Подключен</p>
          <p className="break-all">Адрес: {tonConnectUI.account?.address}</p>
        </div>
      ) : (
        <p>Не подключен</p>
      )}
    </div>
  );
} 