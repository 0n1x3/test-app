export function setupFullscreen() {
  const tg = window.Telegram?.WebApp;
  if (!tg) return;

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

  if (!isMobile) {
    // На десктопе отключаем расширение viewport и fullscreen
    tg.setViewportSettings({
      viewportStableHeight: true,
      expandable: false
    });
    
    // Выходим из fullscreen если он активен
    if (tg.isExpanded) {
      tg.exitFullscreen();
    }
  }

  // Обрабатываем изменения viewport
  tg.onEvent('viewportChanged', () => {
    if (!isMobile && tg.isExpanded) {
      tg.exitFullscreen();
    }
  });
} 