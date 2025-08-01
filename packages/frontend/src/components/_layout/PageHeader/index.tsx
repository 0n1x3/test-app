'use client';

import { Balance } from '@/components/_common/Balance';
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
        <Balance />
        <SettingsButton />
      </div>
    </div>
  );
} 