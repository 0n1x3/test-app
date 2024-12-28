import { useEffect, useState } from 'react';

export function SafeArea({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg) return;

    // Определяем мобильное устройство
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

    tg.onEvent('viewportChanged', handleViewportChanged);
    return () => tg.offEvent('viewportChanged', handleViewportChanged);
  }, []);

  return (
    <div className={`safe-area ${isMobile ? 'mobile' : 'desktop'}`}>
      {children}
    </div>
  );
} 