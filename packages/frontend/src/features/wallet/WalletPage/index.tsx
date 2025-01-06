'use client';

import { useState } from 'react';
import { TonConnectButton } from '@tonconnect/ui-react';
import { Balance } from '@/components/_wallet/Balance';
import { SafeArea } from '@/components/_layout/SafeArea';
import { PageTransition } from '@/components/_layout/PageTransition';
import { PageContainer } from '@/components/_layout/PageContainer';
import { DepositSection } from './DepositSection';
import { WithdrawSection } from './WithdrawSection';
import './styles.css';
import { PageHeader } from '@/components/_layout/PageHeader';

export function WalletPage() {
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');

  return (
    <SafeArea>
      <PageTransition>
        <PageContainer>
          <PageHeader title="Кошелек" />
          <div className="wallet-page">
            <div className="wallet-header">
              <div className="wallet-connect">
                <TonConnectButton />
              </div>
            </div>

            <Balance />

            <div className="wallet-tabs">
              <button
                className={`tab-button ${activeTab === 'deposit' ? 'active' : ''}`}
                onClick={() => setActiveTab('deposit')}
              >
                Пополнить
              </button>
              <button
                className={`tab-button ${activeTab === 'withdraw' ? 'active' : ''}`}
                onClick={() => setActiveTab('withdraw')}
              >
                Вывести
              </button>
            </div>

            <div className="wallet-content">
              {activeTab === 'deposit' ? (
                <DepositSection />
              ) : (
                <WithdrawSection />
              )}
            </div>
          </div>
        </PageContainer>
      </PageTransition>
    </SafeArea>
  );
} 