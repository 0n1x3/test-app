'use client';

import { isMobile } from '@/utils/platform';
import { useEffect, useState } from 'react';
import './style.css';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function PageContainer({ children, className = '' }: PageContainerProps) {
  const [platform, setPlatform] = useState<'mobile' | 'desktop'>('mobile');
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg?.platform) {
      const mobile = !['macos', 'windows', 'linux'].includes(tg.platform);
      setPlatform(mobile ? 'mobile' : 'desktop');
      setIsFullscreen(mobile && tg.isExpanded);
    }
  }, []);

  return (
    <div className={`page-wrapper ${className}`}>
      <div 
        className={`page-content ${platform}`}
        data-fullscreen={isFullscreen}
      >
        {children}
      </div>
    </div>
  );
} 