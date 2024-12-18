'use client';

import { TonConnectUIProvider } from '@tonconnect/ui-react';

export function WalletProvider({ children }: { children: React.ReactNode }) {
  if (typeof window === 'undefined') return null;
  
  return (
    <TonConnectUIProvider 
      manifestUrl="http://localhost:3000/tonconnect-manifest.json"
      enableAndroidBackHandler={false}
    >
      {children}
    </TonConnectUIProvider>
  );
} 