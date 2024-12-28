'use client';

import { DepositPage } from '@/components/DepositPage';
import { SafeArea } from '@/components/SafeArea';
import '@/styles/deposit.css';

export default function Page() {
  return (
    <div className="min-h-screen bg-black">
      <SafeArea>
        <DepositPage />
      </SafeArea>
    </div>
  );
} 