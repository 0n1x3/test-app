'use client';

import { useTranslation } from '@/providers/i18n';
import './styles.css';

export function DepositSection() {
  const { t } = useTranslation();

  return (
    <div className="deposit-section">
      <div className="section-title">{t('pages.wallet.sections.deposit.title')}</div>
      <div className="deposit-methods">
        {/* ... */}
      </div>
    </div>
  );
} 