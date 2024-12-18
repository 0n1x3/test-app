'use client';

import { TonConnectUIProvider, TonConnectButton } from '@tonconnect/ui-react';

export function TonContent() {
  return (
    <TonConnectUIProvider 
      manifestUrl="http://localhost:3000/tonconnect-manifest.json"
      enableAndroidBackHandler={false}
    >
      <div className="flex flex-col items-center gap-8">
        <h1 className="text-4xl font-bold text-center">Test App</h1>
        <TonConnectButton />
      </div>
    </TonConnectUIProvider>
  );
} 