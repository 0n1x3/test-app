'use client';

import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { SettingsButton } from '@/components/_common/SettingsButton';
import './style.css';

interface PageHeaderProps {
  title: string;
}

export function PageHeader({ title }: PageHeaderProps) {
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const webApp = window.Telegram?.WebApp;
        if (!webApp) return;

        const initData = (webApp as any).initData;
        const response = await fetch('https://test.timecommunity.xyz/api/users/init', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ initData }),
        });

        if (response.ok) {
          const data = await response.json();
          setBalance(data.balance || 0);
        }
      } catch (error) {
        console.error('Error fetching balance:', error);
      }
    };

    fetchBalance();
    // Обновляем баланс каждые 30 секунд
    const interval = setInterval(fetchBalance, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="page-header">
      <h1>{title}</h1>
      <div className="header-actions">
        <div className="balance">
          <Icon icon="material-symbols:diamond-rounded" className="balance-icon" />
          <span className="balance-amount">{balance}</span>
        </div>
        <SettingsButton />
      </div>
    </div>
  );
} 