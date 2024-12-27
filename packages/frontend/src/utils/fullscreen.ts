export function setupFullscreen() {
  const tg = window.Telegram?.WebApp;
  if (!tg) return;

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

  // Принудительно отключаем расширение на десктопе
  if (!isMobile) {
    tg.setViewportSettings({
      expandable: false
    });
    // Если уже в полноэкранном режиме - выходим
    if (tg.isExpanded) {
      tg.exitFullscreen();
    }
  }
} 