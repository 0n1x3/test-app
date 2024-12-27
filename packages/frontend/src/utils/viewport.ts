export function setupViewport() {
  const setAppDimensions = () => {
    const doc = document.documentElement;
    doc.style.setProperty('--app-height', `${window.innerHeight}px`);
    doc.style.setProperty('--app-max-width', `min(100vw, 390px)`);
    
    const padding = window.innerWidth < 390 ? '12px' : '16px';
    doc.style.setProperty('--app-padding', padding);
  };

  const tg = window.Telegram?.WebApp;
  if (tg) {
    // Отключаем свайп и фиксируем высоту
    tg.setViewportSettings({
      viewportStableHeight: true,
      expandable: false
    });
    
    // Отключаем закрытие свайпом
    tg.disableClosingConfirmation();
  }

  setAppDimensions();
  window.addEventListener('resize', setAppDimensions);
  window.addEventListener('orientationchange', setAppDimensions);
} 