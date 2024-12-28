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

    // Предотвращаем зум
    const preventZoom = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };

    // Добавляем обработчики для предотвращения зума
    document.addEventListener('touchstart', preventZoom, { passive: false });
    document.addEventListener('touchmove', preventZoom, { passive: false });

    tg.onEvent('viewportChanged', handleViewportChanged);
    
    return () => {
      tg.offEvent('viewportChanged', handleViewportChanged);
      document.removeEventListener('touchstart', preventZoom);
      document.removeEventListener('touchmove', preventZoom);
    };
  }, []);

  return (
    <div 
      className={`safe-area ${isMobile ? 'mobile' : 'desktop'}`}
      style={{ touchAction: 'pan-x pan-y' }} // Разрешаем только скролл
    >
      {children}
    </div>
  );
} 