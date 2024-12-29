export function isMobile() {
  if (typeof window === 'undefined') return false;
  
  const tg = window.Telegram?.WebApp;
  if (tg?.platform) {
    // Используем определение платформы от Telegram
    return !['macos', 'windows', 'linux'].includes(tg.platform);
  }
  
  // Fallback на определение через user agent
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
} 