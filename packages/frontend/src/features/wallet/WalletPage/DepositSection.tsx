'use client';

import { useTranslation } from '@/providers/i18n';
import { useTonConnect } from '@/hooks/wallet/useTonConnect';
import { CONTRACT_ADDRESS } from '@/config';

export function DepositSection() {
  const { t } = useTranslation();
  const { sender } = useTonConnect();
  const walletAddress = CONTRACT_ADDRESS;

  return (
    <div className="deposit-section">
      <div className="address-box">
        <div className="label">{t('pages.wallet.walletAddress')}</div>
        <div className="value-container">
          <span className="address-value">{walletAddress}</span>
          <button 
            onClick={() => navigator.clipboard.writeText(walletAddress)}
            className="copy-button"
          >
            📋
          </button>
        </div>
      </div>

      <div className="qr-container">
        <div className="label">{t('pages.wallet.scanToDeposit')}</div>
        <div className="qr-box">
          <span>{t('pages.wallet.qrCode')}</span>
        </div>
      </div>
    </div>
  );
} 