export function setupViewport() {
  const setAppDimensions = () => {
    const doc = document.documentElement;
    doc.style.setProperty('--app-height', `${window.innerHeight}px`);
    doc.style.setProperty('--app-max-width', `min(100vw, 390px)`);
    
    // Адаптируем padding в зависимости от ширины экрана
    const padding = window.innerWidth < 390 ? '12px' : '16px';
    doc.style.setProperty('--app-padding', padding);
  };

  // Отключаем вертикальный свайп
  const tg = window.Telegram?.WebApp;
  if (tg) {
    tg.setViewportSettings({
      viewportStableHeight: true
    });
  }

  // Set initial dimensions
  setAppDimensions();

  // Update dimensions on resize and orientation change
  window.addEventListener('resize', setAppDimensions);
  window.addEventListener('orientationchange', setAppDimensions);
} 