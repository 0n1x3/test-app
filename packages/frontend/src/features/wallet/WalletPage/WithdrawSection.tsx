'use client';

import { useState } from 'react';
import { useTranslation } from '@/providers/i18n';
import { useTonConnect } from '@/hooks/wallet/useTonConnect';
import { useTestContract } from '@/hooks/wallet/useTestContract';

export function WithdrawSection() {
  const { t } = useTranslation();
  const { sender } = useTonConnect();
  const { contractBalance } = useTestContract();
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');

  const availableBalance = Number(contractBalance || 0) / 1e9;
  const minWithdraw = 2;

  return (
    <div className="withdraw-section">
      <div className="form-group">
        <div className="label">{t('pages.wallet.address')}</div>
        <div className="input-container">
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder={t('pages.wallet.enterAddress')}
            className="input-field"
          />
          <button className="paste-button">{t('pages.wallet.paste')}</button>
        </div>
      </div>

      <div className="form-group">
        <div className="label">{t('pages.wallet.amount')}</div>
        <div className="input-container">
          <input
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={t('pages.wallet.enterAmount')}
            className="input-field"
          />
          <span className="currency">TON</span>
          <button className="max-button">{t('pages.wallet.max')}</button>
        </div>
      </div>

      <div className="info-container">
        <span>
          {t('pages.wallet.minimum')} {minWithdraw} TON
        </span>
        <span>
          {t('pages.wallet.available')} {availableBalance.toFixed(2)} TON
        </span>
      </div>

      <button 
        className="submit-button"
        disabled={!sender || !address || !amount}
      >
        {t('pages.wallet.next')}
      </button>
    </div>
  );
} 