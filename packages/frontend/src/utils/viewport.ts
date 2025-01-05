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

    const isMobileApp = !['macos', 'windows', 'linux'].includes(tg.platform);
    document.documentElement.dataset.platform = isMobileApp ? 'mobile' : 'desktop';

    document.documentElement.dataset.fullscreen = String(tg.isExpanded);

    if (isMobileApp) {
      tg.expand();
    }

    tg.onEvent('viewportChanged', ({ isStateStable }) => {
      if (isStateStable) {
        document.documentElement.dataset.fullscreen = String(tg.isExpanded);
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