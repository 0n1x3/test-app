import { useTonConnectUI } from '@tonconnect/ui-react';
import { useEffect, useState } from 'react';

export function useTonConnect() {
  const [tonConnectUI] = useTonConnectUI();
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const unsubscribe = tonConnectUI.onStatusChange(wallet => {
      setConnected(!!wallet);
    });

    return () => {
      unsubscribe();
    };
  }, [tonConnectUI]);

  return {
    connected,
    wallet: tonConnectUI.wallet,
    tonConnectUI
  };
}