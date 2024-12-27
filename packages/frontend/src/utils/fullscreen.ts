export function setupFullscreen() {
  if (window.Telegram?.WebApp) {
    const { WebApp } = window.Telegram;

    // Проверяем, является ли устройство мобильным
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

    if (!isMobile) {
      // На десктопе отключаем расширение viewport
      WebApp.setViewportSettings({
        expandable: false
      });
    }

    // Настраиваем обработку полноэкранного режима
    WebApp.onEvent('viewportChanged', () => {
      if (!isMobile && WebApp.isExpanded) {
        WebApp.exitFullscreen();
      }
    });
  }
} 