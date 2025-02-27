'use client';

import React, { useEffect, useState } from 'react';
import './style.css';

// Используем React.memo для предотвращения ненужных ререндеров
export const SafeArea = React.memo(function SafeArea({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const [layoutInfo, setLayoutInfo] = useState({
    isMobile: false,
    isFullscreen: false
  });
  
  // Определяем свойства платформы только при монтировании
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg?.platform) {
      const mobile = !['macos', 'windows', 'linux'].includes(tg.platform);
      setLayoutInfo({
        isMobile: mobile,
        isFullscreen: mobile && tg.isExpanded
      });
    }
    
    // Слушаем изменения режима отображения
    const handleViewportChange = () => {
      const tg = window.Telegram?.WebApp;
      if (tg?.platform) {
        const mobile = !['macos', 'windows', 'linux'].includes(tg.platform);
        setLayoutInfo(prev => ({
          ...prev,
          isFullscreen: mobile && tg.isExpanded
        }));
      }
    };
    
    window.addEventListener('viewportchange', handleViewportChange);
    
    return () => {
      window.removeEventListener('viewportchange', handleViewportChange);
    };
  }, []);

  const { isMobile, isFullscreen } = layoutInfo;
  
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
}); 