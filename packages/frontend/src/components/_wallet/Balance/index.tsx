'use client';

interface TokenBalance {
  symbol: string;
  amount: string;
  usdPrice: number;
  logo: string;
}

export function Balance() {
  // Временные данные, потом заменим на реальные
  const tokens: TokenBalance[] = [
    { symbol: 'TON', amount: '0.00', usdPrice: 0, logo: '/assets/tokens/ton.png' },
    { symbol: 'USDT', amount: '0.00', usdPrice: 0, logo: '/assets/tokens/usdt.png' },
    { symbol: 'TIME', amount: '0.00', usdPrice: 0, logo: '/assets/tokens/time.png' },
  ];

  const totalUsdBalance = tokens.reduce((acc, token) => acc + token.usdPrice, 0);

  return (
    <div className="balance-card">
      <div className="balance-header">
        <div className="balance-title">Total Balance</div>
        <div className="balance-total">≈ ${totalUsdBalance.toFixed(2)} USD</div>
      </div>
      
      <div className="tokens-list">
        {tokens.map((token) => (
          <div key={token.symbol} className="token-item">
            <div className="token-info">
              <img src={token.logo} alt={token.symbol} className="token-logo" />
              <div className="token-details">
                <div className="token-amount">{token.amount} {token.symbol}</div>
                <div className="token-price">≈ ${token.usdPrice.toFixed(2)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 