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
  
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    // Проверяем платформу напрямую из Telegram WebApp
    if (tg?.platform) {
      setPlatform(!['macos', 'windows', 'linux'].includes(tg.platform) ? 'mobile' : 'desktop');
    }
  }, []);

  return (
    <div className={`page-wrapper ${className}`} style={{ margin: 0, padding: 0 }}>
      <div className={`page-content ${platform}`} style={{ margin: 0 }}>
        {children}
      </div>
    </div>
  );
} 