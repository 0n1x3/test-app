const tg = window.Telegram?.WebApp;

export const isTelegramWebAppAvailable = (): boolean => {
  return Boolean(tg);
};

export const initTelegramApp = (): (() => void) | void => {
  if (!tg) return () => {};

  tg.disableClosingConfirmation();
  tg.expand();

  const setAppHeight = () => {
    const height = `${tg.viewportStableHeight}px`;
    document.documentElement.style.setProperty('--app-height', height);
  };

  const viewportHandler = ({ isStateStable }: { isStateStable: boolean }) => {
    if (isStateStable) {
      setAppHeight();
    }
  };

  setAppHeight();
  tg.ready();
  tg.onEvent('viewportChanged', viewportHandler);

  return () => {
    tg.offEvent('viewportChanged', viewportHandler);
  };
}; 