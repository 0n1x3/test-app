export function setupFullscreen() {
  const tg = window.Telegram?.WebApp;
  if (!tg) return;

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

  if (!isMobile) {
    // На десктопе закрываем расширенный режим
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