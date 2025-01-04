'use client';

import { TonConnectButton } from '@tonconnect/ui-react';

export function TonConnectButtonWrapper() {
  return (
    <div className="flex flex-col items-center gap-8">
      <h1 className="text-4xl font-bold text-center">Test App</h1>
      <TonConnectButton />
    </div>
  );
}