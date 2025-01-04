import { useEffect, useState } from 'react';
import './style.css';

export function SafeArea({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg?.platform) {
      setIsMobile(!['macos', 'windows', 'linux'].includes(tg.platform));
    }
  }, []);

  return (
    <div 
      className={`safe-area ${isMobile ? 'mobile' : 'desktop'}`}
      style={{ 
        height: 'var(--tg-viewport-stable-height)',
        position: 'relative',
        overflow: 'hidden',
        margin: 0,
        padding: 0
      }}
    >
      {children}
    </div>
  );
} 