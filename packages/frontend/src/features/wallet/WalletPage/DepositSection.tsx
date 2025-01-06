'use client';

import { useTonConnect } from '@/hooks/wallet/useTonConnect';
import { CONTRACT_ADDRESS } from '@/config';

export function DepositSection() {
  const { sender } = useTonConnect();
  const walletAddress = CONTRACT_ADDRESS;

  return (
    <div className="deposit-section">
      <div className="address-box">
        <div className="label">Wallet address</div>
        <div className="value-container">
          <span className="address-value">{walletAddress}</span>
          <button 
            onClick={() => navigator.clipboard.writeText(walletAddress)}
            className="copy-button"
          >
            📋
          </button>
        </div>
      </div>

      <div className="qr-container">
        <div className="label">Scan to deposit</div>
        <div className="qr-box">
          <span>QR Code</span>
        </div>
      </div>
    </div>
  );
} 