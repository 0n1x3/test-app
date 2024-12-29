'use client';

import { isMobile } from '@/utils/platform';
import { useEffect, useState } from 'react';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function PageContainer({ children, className = '' }: PageContainerProps) {
  const [platform, setPlatform] = useState<'mobile' | 'desktop'>('mobile');
  
  useEffect(() => {
    setPlatform(isMobile() ? 'mobile' : 'desktop');
  }, []);

  return (
    <div className={`page-wrapper ${className}`}>
      <div className={`page-content ${platform}`}>
        {children}
      </div>
    </div>
  );
} 