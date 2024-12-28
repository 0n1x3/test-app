export function setupViewport() {
  const setAppDimensions = () => {
    const doc = document.documentElement;
    doc.style.setProperty('--app-max-width', `min(100vw, 390px)`);
    const padding = window.innerWidth < 390 ? '12px' : '16px';
    doc.style.setProperty('--app-padding', padding);
  };

  const tg = window.Telegram?.WebApp;
  if (tg) {
    // Сначала сообщаем что приложение готово
    tg.ready();

    // Отключаем закрытие по свайпу
    tg.disableVerticalSwipes();
    tg.enableClosingConfirmation();

    // Определяем мобильное устройство
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

    // На мобильных включаем fullscreen
    if (isMobile && 'requestFullscreen' in tg) {
      tg.requestFullscreen();
    } else {
      // На десктопе просто расширяем
      tg.expand();
    }

    // Устанавливаем цвета в соответствии с темой
    if (tg.themeParams) {
      tg.setHeaderColor(tg.themeParams.bg_color);
      tg.setBackgroundColor(tg.themeParams.secondary_bg_color);
    }
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