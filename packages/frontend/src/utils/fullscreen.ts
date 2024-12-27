export function setupFullscreen() {
  if (window.Telegram?.WebApp) {
    const { WebApp } = window.Telegram;

    // Проверяем, является ли устройство мобильным
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

    // Обработчик для запроса полноэкранного режима
    WebApp.onEvent('viewportChanged', () => {
      if (!isMobile) {
        // На десктопе принудительно отключаем полноэкранный режим
        WebApp.isExpanded && WebApp.exitFullscreen();
      }
    });

    // Настраиваем обработку полноэкранного режима
    WebApp.onEvent('fullscreenChanged', (isFullscreen) => {
      if (!isMobile && isFullscreen) {
        // Если это десктоп и пытается войти в полноэкранный режим - отменяем
        WebApp.exitFullscreen();
      }
    });
  }
} 