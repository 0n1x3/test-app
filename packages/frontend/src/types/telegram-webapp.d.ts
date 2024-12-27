interface TelegramWebApp {
  WebApp: {
    setViewportSettings: (params: { 
      viewportStableHeight?: boolean;
      expandable?: boolean;
    }) => void;
    isExpanded: boolean;
    exitFullscreen: () => void;
    onEvent: (eventType: string, callback: (params?: any) => void) => void;
  };
}

interface Window {
  Telegram?: TelegramWebApp;
} 