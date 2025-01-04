'use client';

export function CoinsDisplay({ amount = 0 }) {
  return (
    <div className="coins-display">
      <span className="coin-amount">{amount}</span>
      <div className="coin-icon">⭐️</div>
    </div>
  );
} 