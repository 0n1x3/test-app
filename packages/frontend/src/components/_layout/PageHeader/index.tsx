'use client';

import { Icon } from '@iconify/react';
import { SettingsButton } from '@/components/_common/SettingsButton';
import './style.css';

interface PageHeaderProps {
  title: string;
}

export function PageHeader({ title }: PageHeaderProps) {
  return (
    <div className="page-header">
      <h1>{title}</h1>
      <div className="header-actions">
        <div className="balance">
          <Icon icon="solar:dollar-minimalistic-linear" className="balance-icon" />
          <span className="balance-amount">0</span>
        </div>
        <SettingsButton />
      </div>
    </div>
  );
} 