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
    // Инициализируем приложение
    tg.ready();

    // Устанавливаем параметры viewport
    tg.setViewportSettings({
      viewportStableHeight: true,
      expandable: false
    });

    // Отключаем закрытие по свайпу
    tg.disableClosingConfirmation();

    // Устанавливаем цвета в соответствии с темой
    tg.setHeaderColor(tg.themeParams.bg_color);
    tg.setBackgroundColor(tg.themeParams.secondary_bg_color);
  }

  // Обработчик изменения viewport
  tg?.onEvent('viewportChanged', ({ isStateStable }) => {
    if (isStateStable) {
      setAppDimensions();
    }
  });

  setAppDimensions();
  window.addEventListener('resize', setAppDimensions);
  window.addEventListener('orientationchange', setAppDimensions);
} 