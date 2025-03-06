import React from 'react';
import { Icon } from '@iconify/react';
import './BetInfo.css';

interface BetInfoProps {
  amount: number;
}

export function BetInfo({ amount }: BetInfoProps) {
  return (
    <div className="bet-info">
      <Icon icon="material-symbols:diamond-rounded" />
      <span className="bet-info__amount">{amount}</span>
    </div>
  );
} 