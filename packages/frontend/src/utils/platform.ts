export function isMobile() {
  if (typeof window === 'undefined') return false;
  
  const tg = window.Telegram?.WebApp;
  if (tg?.platform) {
    return !['macos', 'windows', 'linux'].includes(tg.platform);
  }
  
  return false;
} 