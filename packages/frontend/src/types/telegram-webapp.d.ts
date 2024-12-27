declare global {
  interface TelegramWebApp {
    setViewportSettings: (params: { 
      viewportStableHeight?: boolean;
      expandable?: boolean;
    }) => void;
    isExpanded: boolean;
    expand: () => void;
    close: () => void;
    exitFullscreen: () => void;
    onEvent: (eventType: string, callback: (params?: any) => void) => void;
    offEvent: (eventType: string, callback: (params?: any) => void) => void;
    ready: () => void;
    MainButton: {
      show: () => void;
      hide: () => void;
      setText: (text: string) => void;
      onClick: (callback: () => void) => void;
    };
    disableClosingConfirmation: () => void;
    viewportHeight: number;
    viewportStableHeight: number;
    platform: string;
  }

  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    }
  }
}

export {}; 