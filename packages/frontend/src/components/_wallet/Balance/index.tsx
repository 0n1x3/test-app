'use client';

interface TokenBalance {
  symbol: string;
  amount: string;
  usdPrice: number;
  logo: string;
}

export function Balance() {
  const tokens: TokenBalance[] = [
    { symbol: 'TON', amount: '0.00', usdPrice: 0, logo: '/assets/tokens/ton.png' },
    { symbol: 'USDT', amount: '0.00', usdPrice: 0, logo: '/assets/tokens/usdt.png' },
    { symbol: 'TIME', amount: '0.00', usdPrice: 0, logo: '/assets/tokens/time.png' },
  ];

  const totalUsdBalance = tokens.reduce((acc, token) => acc + token.usdPrice, 0);

  return (
    <div style={{
      background: '#1A1A1A',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '16px',
    }}>
      {/* Общий баланс */}
      <div style={{
        marginBottom: '16px',
        paddingBottom: '16px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      }}>
        <div style={{ fontSize: '13px', color: '#808080', marginBottom: '4px' }}>
          Total Balance
        </div>
        <div style={{ 
          fontSize: '28px', 
          fontWeight: 600, 
          color: '#FFFFFF',
          letterSpacing: '-0.5px',
          display: 'flex',
          alignItems: 'baseline',
          gap: '4px'
        }}>
          ${totalUsdBalance.toFixed(2)}
          <span style={{ fontSize: '20px', color: '#808080' }}>USD</span>
        </div>
      </div>
      
      {/* Список токенов */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {tokens.map((token) => (
          <div key={token.symbol} style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '4px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img 
                src={token.logo} 
                alt={token.symbol}
                style={{
                  width: '36px',
                  height: '36px',
                  minWidth: '36px',
                  minHeight: '36px',
                  borderRadius: '50%',
                  objectFit: 'cover'
                }}
              />
              <div style={{ 
                fontSize: '15px', 
                fontWeight: 500, 
                color: '#FFFFFF',
                letterSpacing: '-0.2px' 
              }}>
                {token.amount} {token.symbol}
              </div>
            </div>
            
            <div style={{ 
              fontSize: '15px', 
              color: '#808080',
              letterSpacing: '-0.2px'
            }}>
              ${token.usdPrice.toFixed(2)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 