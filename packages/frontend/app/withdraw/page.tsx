'use client';

import { WithdrawPage } from '@/components/WithdrawPage';
import { SafeArea } from '@/components/SafeArea';
import '@/styles/withdraw.css';

export default function Page() {
  return (
    <div className="min-h-screen bg-black">
      <SafeArea>
        <WithdrawPage />
      </SafeArea>
    </div>
  );
} 