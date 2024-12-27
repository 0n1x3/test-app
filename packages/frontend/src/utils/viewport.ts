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
    // Устанавливаем стабильную высоту viewport и отключаем расширение
    tg.setViewportSettings({
      viewportStableHeight: true,
      expandable: false
    });

    // Отключаем закрытие по свайпу
    tg.disableClosingConfirmation();

    // Сообщаем приложению что оно готово
    tg.ready();
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