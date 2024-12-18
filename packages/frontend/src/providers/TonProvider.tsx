'use client';

import { TonConnectUIProvider } from '@tonconnect/ui-react';

export function TonProvider({ children }: { children: React.ReactNode }) {
  // Определяем URL манифеста в зависимости от окружения
  const manifestUrl = process.env.NODE_ENV === 'production'
    ? 'https://test.timecommunity.xyz/tonconnect-manifest.json'
    : 'http://localhost:3000/tonconnect-manifest.json';

  return (
    <TonConnectUIProvider 
      manifestUrl={manifestUrl}
      actionsConfiguration={{
        twaReturnUrl: process.env.NODE_ENV === 'production' 
          ? 'https://test.timecommunity.xyz'
          : 'http://localhost:3000'
      }}
    >
      {children}
    </TonConnectUIProvider>
  );
} 