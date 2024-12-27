export function setupFullscreen() {
  const tg = window.Telegram?.WebApp;
  if (!tg) return;

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

  if (!isMobile) {
    // На десктопе отключаем расширение viewport
    tg.setViewportSettings({
      viewportStableHeight: true,
      expandable: false
    });
    
    // Если открыто в расширенном режиме - закрываем
    if (tg.isExpanded) {
      tg.close();
    }
  }

  // Обрабатываем изменения viewport
  tg.onEvent('viewportChanged', () => {
    if (!isMobile && tg.isExpanded) {
      tg.close();
    }
  });
} 