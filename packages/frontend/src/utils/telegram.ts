const tg = window.Telegram?.WebApp;

export const isTelegramWebAppAvailable = (): boolean => {
  return Boolean(tg);
};

export const initTelegramApp = (): (() => void) | void => {
  if (!tg) return () => {};

  tg.setViewportSettings({
    viewportStableHeight: true,
    expandable: false
  });

  tg.disableClosingConfirmation();
  tg.expand();

  const expandApp = () => {
    if (tg.viewportHeight < tg.viewportStableHeight) {
      tg.expand();
      setTimeout(expandApp, 100);
    }
  };

  const viewportHandler = () => {
    if (!tg.isExpanded) {
      expandApp();
    }
  };

  expandApp();
  tg.ready();
  tg.onEvent('viewportChanged', viewportHandler);

  return () => {
    tg.offEvent('viewportChanged', viewportHandler);
  };
}; 