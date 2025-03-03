/**
 * Утилиты для работы с Telegram WebApp
 */

// Типы данных пользователя Telegram
interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

/**
 * Получает данные пользователя Telegram
 * Сначала пытается получить из WebApp, затем из localStorage
 */
export function getTelegramUser(): TelegramUser | null {
  try {
    // Сначала пытаемся получить из WebApp
    if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
      const user = window.Telegram.WebApp.initDataUnsafe.user;
      return user;
    }
    
    // Затем пробуем получить из localStorage
    const cachedUser = localStorage.getItem('telegramWebAppUser');
    if (cachedUser) {
      return JSON.parse(cachedUser);
    }
    
    // Если не нашли, возвращаем null
    return null;
  } catch (error) {
    console.error('Ошибка при получении данных пользователя Telegram:', error);
    return null;
  }
}

/**
 * Получает initData Telegram WebApp
 * Сначала пытается получить из WebApp, затем из localStorage
 */
export function getTelegramInitData(): string | null {
  try {
    // Сначала пытаемся получить из WebApp
    if (window.Telegram?.WebApp?.initData) {
      return window.Telegram.WebApp.initData;
    }
    
    // Затем пробуем получить из localStorage
    const cachedInitData = localStorage.getItem('telegramWebAppInitData');
    if (cachedInitData) {
      return cachedInitData;
    }
    
    // Если не нашли, возвращаем null
    return null;
  } catch (error) {
    console.error('Ошибка при получении initData Telegram:', error);
    return null;
  }
}

/**
 * Сохраняет данные пользователя Telegram в localStorage
 */
export function saveTelegramUserData(): void {
  try {
    if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
      localStorage.setItem('telegramWebAppUser', JSON.stringify(window.Telegram.WebApp.initDataUnsafe.user));
    }
    
    if (window.Telegram?.WebApp?.initData) {
      localStorage.setItem('telegramWebAppInitData', window.Telegram.WebApp.initData);
    }
  } catch (error) {
    console.error('Ошибка при сохранении данных пользователя Telegram:', error);
  }
}

/**
 * Получает полные данные для Telegram API
 */
export function getTelegramData() {
  const user = getTelegramUser();
  const initData = getTelegramInitData();
  
  if (!user || !initData) {
    throw new Error('Данные Telegram WebApp недоступны');
  }
  
  return {
    userId: user.id,
    initData: initData
  };
}

/**
 * Создает уникальный идентификатор гостя
 */
export function getOrCreateGuestId(): string {
  // Проверяем сохраненный гостевой ID
  const savedGuestId = localStorage.getItem('guestId');
  if (savedGuestId) {
    return savedGuestId;
  }
  
  // Создаем новый ID
  const guestId = `guest_${Math.random().toString(36).substr(2, 5)}`;
  localStorage.setItem('guestId', guestId);
  return guestId;
}

/**
 * Получает ID пользователя из разных источников
 */
export function getUserId(): string | null {
  // Пытаемся получить из Telegram WebApp
  const user = getTelegramUser();
  if (user?.id) {
    return user.id.toString();
  }
  
  // Пробуем получить из хранилища состояния (зависит от реализации)
  // ...
  
  // Возвращаем гостевой ID как крайний вариант
  return getOrCreateGuestId();
} 