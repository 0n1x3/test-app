'use client';
import { useRouter } from 'next/navigation';

export function Balance() {
  const router = useRouter();

  const handleWallet = () => {
    router.push('/wallet');
  };

  return (
    <div className="balance-card">
      <div>
        <h3 className="balance-title">Balance</h3>
        <div className="balance-main">
          <div>
            <div className="balance-info">
              <span className="balance-amount">0.00</span>
              <span className="balance-currency">TON</span>
            </div>
            <div className="balance-fiat">≈ $0.00 USD</div>
          </div>
          <div className="balance-actions">
            <button className="balance-button deposit" onClick={handleWallet}>
              Deposit
            </button>
            <button className="balance-button withdraw" onClick={handleWallet}>
              Withdraw
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 