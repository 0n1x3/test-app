import { useEffect, useState } from 'react';

export function SafeArea({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg) return;

    const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
    setIsMobile(mobile);

    // Устанавливаем стили для root
    const root = document.documentElement;
    root.style.setProperty('--tg-viewport-height', `${tg.viewportHeight}px`);
    root.style.setProperty('--tg-viewport-stable-height', `${tg.viewportStableHeight}px`);

    const handleViewportChanged = () => {
      root.style.setProperty('--tg-viewport-height', `${tg.viewportHeight}px`);
      root.style.setProperty('--tg-viewport-stable-height', `${tg.viewportStableHeight}px`);
    };

    // Предотвращаем зум и нежелательные жесты
    const preventGestures = (e: TouchEvent) => {
      // Разрешаем скролл только внутри safe-area
      if (!(e.target as Element)?.closest('.safe-area')) {
        e.preventDefault();
      }
    };

    document.addEventListener('touchstart', preventGestures, { passive: false });
    document.addEventListener('touchmove', preventGestures, { passive: false });

    tg.onEvent('viewportChanged', handleViewportChanged);
    
    return () => {
      tg.offEvent('viewportChanged', handleViewportChanged);
      document.removeEventListener('touchstart', preventGestures);
      document.removeEventListener('touchmove', preventGestures);
    };
  }, []);

  return (
    <div 
      className={`safe-area ${isMobile ? 'mobile' : 'desktop'}`}
      style={{ 
        height: 'var(--tg-viewport-stable-height)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {children}
    </div>
  );
} 