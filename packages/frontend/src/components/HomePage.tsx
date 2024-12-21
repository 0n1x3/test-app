'use client';

import { useIsConnectionRestored } from '@tonconnect/ui-react';
import { TonConnectButton } from '@tonconnect/ui-react';
import { ConnectionStatus } from './ConnectionStatus';
import { ContractOperations } from './ContractOperations';
import { useTonConnect } from '@/hooks/useTonConnect';
import { useEffect } from 'react';
import { initTelegramApp, isTelegramWebAppAvailable } from '@/utils/telegram';
import { formatAddress } from '@/utils/format';

export function HomePage() {
  const connectionRestored = useIsConnectionRestored();
  const { tonConnectUI } = useTonConnect();

  // Инициализация Telegram WebApp
  useEffect(() => {
    const isTelegram = isTelegramWebAppAvailable();
    
    if (isTelegram) {
      document.body.classList.add('telegram-app');
    }

    const cleanup = initTelegramApp();
    return () => {
      if (cleanup) cleanup();
      if (isTelegram) {
        document.body.classList.remove('telegram-app');
      }
    };
  }, []);

  // Проверяем, запущено ли приложение в Telegram
  const isTelegram = isTelegramWebAppAvailable();

  if (!connectionRestored) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <main style={{ 
      backgroundColor: '#000000',
      margin: 0,
      padding: 0,
      minHeight: isTelegram ? '100%' : '100vh',
      width: '100vw',
      overflow: isTelegram ? 'hidden' : 'auto'
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