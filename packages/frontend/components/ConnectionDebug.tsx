import { useTonConnectUI } from '@tonconnect/ui-react';
import { useEffect } from 'react';

export const ConnectionDebug = () => {
  const [tonConnectUI] = useTonConnectUI();

  useEffect(() => {
    const unsubscribe = tonConnectUI.onStatusChange((wallet) => {
      console.log('Wallet status changed:', {
        wallet,
        connected: tonConnectUI.connected,
        account: tonConnectUI.account,
      });
    });

    return () => {
      unsubscribe();
    };
  }, [tonConnectUI]);

  return null;
}; 