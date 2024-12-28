export function setupViewport() {
  const setAppDimensions = () => {
    const doc = document.documentElement;
    doc.style.setProperty('--app-max-width', `min(100vw, 390px)`);
    const padding = window.innerWidth < 390 ? '12px' : '16px';
    doc.style.setProperty('--app-padding', padding);
  };

  const tg = window.Telegram?.WebApp;
  if (tg) {
    tg.ready();
    tg.disableVerticalSwipes();
    tg.enableClosingConfirmation();

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

    // Устанавливаем атрибут для определения режима
    document.documentElement.dataset.fullscreen = 'false';

    if (isMobile && 'requestFullscreen' in tg) {
      tg.requestFullscreen();
      document.documentElement.dataset.fullscreen = 'true';
    } else {
      tg.expand();
    }

    // Обработчик изменения режима
    tg.onEvent('viewportChanged', ({ isStateStable }) => {
      if (isStateStable) {
        document.documentElement.dataset.fullscreen = 
          isMobile && tg.isExpanded ? 'true' : 'false';
        setAppDimensions();
      }
    });

    if (tg.themeParams) {
      tg.setHeaderColor(tg.themeParams.bg_color);
      tg.setBackgroundColor(tg.themeParams.secondary_bg_color);
    }
  }

  setAppDimensions();
  window.addEventListener('resize', setAppDimensions);
  window.addEventListener('orientationchange', setAppDimensions);
} 