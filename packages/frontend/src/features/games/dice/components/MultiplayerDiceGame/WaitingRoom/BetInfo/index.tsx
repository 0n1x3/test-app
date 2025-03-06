import React from 'react';
import { Icon } from '@iconify/react';
import './style.css';

interface BetInfoProps {
  amount: number;
}

export function BetInfo({ amount }: BetInfoProps) {
  // Преобразуем amount в число и проверяем, что оно не NaN
  const betAmount = Number(amount);
  const displayAmount = !isNaN(betAmount) ? betAmount : 0;
  
  console.log('BetInfo rendering with amount:', { 
    originalAmount: amount, 
    betAmount, 
    displayAmount 
  });
  
  return (
    <div className="bet-info">
      <Icon icon="material-symbols:diamond-rounded" />
      <span className="bet-info__amount">{displayAmount}</span>
    </div>
  );
} 