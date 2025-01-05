'use client';

import { useEffect, useState } from 'react';
import './style.css';

export function SafeArea({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg?.platform) {
      const mobile = !['macos', 'windows', 'linux'].includes(tg.platform);
      setIsMobile(mobile);
      setIsFullscreen(mobile && tg.isExpanded);
    }
  }, []);

  return (
    <div 
      className={`safe-area ${isMobile ? 'mobile' : 'desktop'}`}
      data-fullscreen={isFullscreen}
    >
      <div className="safe-area-content">
        {children}
      </div>
    </div>
  );
} 