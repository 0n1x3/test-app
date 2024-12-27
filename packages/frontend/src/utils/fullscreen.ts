export function setupFullscreen() {
  const tg = window.Telegram?.WebApp;
  if (!tg) return;

  // Проверяем, является ли устройство мобильным
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

  if (!isMobile) {
    // На десктопе отключаем расширение viewport
    tg.setViewportSettings({
      expandable: false
    });
  }

  // Настраиваем обработку полноэкранного режима
  tg.onEvent('viewportChanged', () => {
    if (!isMobile && tg.isExpanded) {
      tg.exitFullscreen();
    }
  });
} 