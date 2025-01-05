'use client';

export function Balance() {
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
        </div>
      </div>
    </div>
  );
} 