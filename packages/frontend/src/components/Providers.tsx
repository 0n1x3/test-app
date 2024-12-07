'use client';

import { TonConnectUIProvider } from '@tonconnect/ui-react';

const manifestUrl = 'http://localhost:3000/tonconnect-manifest.json';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      {children}
    </TonConnectUIProvider>
  );
} 