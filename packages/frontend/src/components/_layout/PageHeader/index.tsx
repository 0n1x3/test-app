'use client';

import { useEffect } from 'react';
import { Icon } from '@iconify/react';
import { SettingsButton } from '@/components/_common/SettingsButton';
import { useUserStore } from '@/store/useUserStore';
import './style.css';

interface PageHeaderProps {
  title: string;
}

export function PageHeader({ title }: PageHeaderProps) {
  const { balance, fetchUserData } = useUserStore();

  useEffect(() => {
    // Загружаем данные только один раз при монтировании
    fetchUserData();
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