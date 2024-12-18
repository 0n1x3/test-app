'use client';

import { useIsConnectionRestored } from '@tonconnect/ui-react';
import { TonConnectButton } from '@tonconnect/ui-react';
import { DepositForm } from './DepositForm';
import { WithdrawForm } from './WithdrawForm';

export function HomePage() {
  const connectionRestored = useIsConnectionRestored();

  if (!connectionRestored) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center gap-8">
      <h1 className="text-4xl font-bold text-center">Test App</h1>
      <TonConnectButton />
      <div className="w-full max-w-md">
        <DepositForm />
        <WithdrawForm />
      </div>
    </div>
  );
} 