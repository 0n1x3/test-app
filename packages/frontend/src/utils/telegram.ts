import { TelegramWebApp } from '../types/telegram';

export const tg = window.Telegram?.WebApp;

export const isTelegramWebAppAvailable = (): boolean => {
  return Boolean(tg);
};

export const initTelegramApp = (): (() => void) | void => {
  if (!isTelegramWebAppAvailable()) return () => {};

  // Предотвращаем закрытие при свайпе
  tg!.disableClosingConfirmation();
  tg!.expand();

  const expandApp = () => {
    if (tg!.viewportHeight < tg!.viewportStableHeight) {
      tg!.expand();
      setTimeout(expandApp, 100);
    }
  };

  // Обработчик изменения viewport
  const viewportHandler = () => {
    if (!tg!.isExpanded) {
      expandApp();
    }
  };

  // Инициализация
  expandApp();
  tg!.ready();
  tg!.onEvent('viewportChanged', viewportHandler);

  return () => {
    tg!.offEvent('viewportChanged', viewportHandler);
  };
}; 