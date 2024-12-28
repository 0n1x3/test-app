declare global {
  interface TelegramWebApp {
    ready: () => void;
    expand: () => void;
    close: () => void;
    isExpanded: boolean;
    viewportHeight: number;
    viewportStableHeight: number;
    enableClosingConfirmation: () => void;
    disableVerticalSwipes: () => void;
    onEvent: (eventType: string, eventHandler: (params: { isStateStable?: boolean }) => void) => void;
    offEvent: (eventType: string, eventHandler: Function) => void;
    initDataUnsafe: {
      user?: {
        id?: number;
      };
    };
    themeParams?: {
      bg_color: string;
      secondary_bg_color: string;
      text_color: string;
      hint_color: string;
      link_color: string;
      button_color: string;
      button_text_color: string;
    };
    setHeaderColor: (color: string) => void;
    setBackgroundColor: (color: string) => void;
  }

  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    }
  }
}

export {}; 