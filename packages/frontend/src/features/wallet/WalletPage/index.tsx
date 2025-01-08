'use client';

import { useState } from 'react';
import { TonConnectButton } from '@tonconnect/ui-react';
import { Balance } from '@/components/_wallet/Balance';
import { SafeArea } from '@/components/_layout/SafeArea';
import { PageContainer } from '@/components/_layout/PageContainer';
import { DepositSection } from './DepositSection';
import { WithdrawSection } from './WithdrawSection';
import { PageHeader } from '@/components/_layout/PageHeader';
import { useTranslation } from '@/providers/i18n';
import './styles.css';

export function WalletPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');

  return (
    <SafeArea>
      <PageContainer>
        <PageHeader title={t('pages.wallet.title')} />
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
              {t('pages.wallet.deposit')}
            </button>
            <button
              className={`tab-button ${activeTab === 'withdraw' ? 'active' : ''}`}
              onClick={() => setActiveTab('withdraw')}
            >
              {t('pages.wallet.withdraw')}
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
    </SafeArea>
  );
} 