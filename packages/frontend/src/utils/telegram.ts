const tg = window.Telegram?.WebApp;

export const isTelegramWebAppAvailable = (): boolean => {
  return Boolean(tg);
};

export const initTelegramApp = (): (() => void) | void => {
  if (!tg) return () => {};

  const expandApp = () => {
    tg.expand();
    
    if (tg.viewportHeight < tg.viewportStableHeight) {
      setTimeout(expandApp, 100);
    }
  };

  expandApp();
  tg.ready();

  // Отключаем вертикальный свайп
  tg.disableVerticalSwipes();
  tg.enableClosingConfirmation();

  const viewportChangedHandler = () => {
    if (tg.isExpanded) {
      console.log('Приложение развернуто на весь экран');
    } else {
      console.log('Приложение не развернуто на весь экран');
    }
  };

  tg.onEvent('viewportChanged', viewportChangedHandler);

  return () => {
    tg.offEvent('viewportChanged', viewportChangedHandler);
  };
}; 