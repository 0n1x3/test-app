'use client';
import { TonConnectButton } from '@tonconnect/ui-react';
import './style.css';

export function Balance() {
  return (
    <div className="balance-card">
      <div className="balance-container">
        <div className="balance-main">
          <div className="balance-title">Balance</div>
          <div className="balance-info">
            <span className="balance-amount">0.00</span>
            <span className="balance-currency">TON</span>
          </div>
          <div className="balance-fiat">≈ $0.00 USD</div>
        </div>
        <div className="wallet-connect">
          <TonConnectButton />
        </div>
      </div>
    </div>
  );
} 