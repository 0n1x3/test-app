'use client';

import { Icon } from '@iconify/react';
import { useUserStore } from '@/store/useUserStore';
import './style.css';

export function Balance() {
  const { balance } = useUserStore();

  return (
    <div className="balance-wrapper">
      <Icon 
        icon="material-symbols:diamond-rounded" 
        className="balance-wrapper__icon" 
      />
      <span className="balance-wrapper__amount">
        {balance}
      </span>
    </div>
  );
} 