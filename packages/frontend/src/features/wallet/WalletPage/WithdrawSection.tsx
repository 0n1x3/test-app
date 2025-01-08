'use client';

import { useTranslation } from '@/providers/i18n';
import './styles.css';

export function WithdrawSection() {
  const { t } = useTranslation();

  return (
    <div className="withdraw-section">
      <div className="section-title">{t('pages.wallet.sections.withdraw.title')}</div>
      <div className="withdraw-methods">
        {/* ... */}
      </div>
    </div>
  );
} 