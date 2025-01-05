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

export function WalletPage() {
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');

  return (
    <SafeArea>
      <PageTransition>
        <PageContainer>
          <div className="page-header">
            <h1>Кошелек</h1>
          </div>
          
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