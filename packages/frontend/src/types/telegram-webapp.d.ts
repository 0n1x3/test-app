declare global {
  interface TelegramWebApp {
    ready: () => void;
    disableClosingConfirmation: () => void;
    setHeaderColor: (color: string) => void;
    setBackgroundColor: (color: string) => void;
    themeParams: {
      bg_color: string;
      secondary_bg_color: string;
      text_color: string;
      hint_color: string;
      link_color: string;
      button_color: string;
      button_text_color: string;
    };
    isExpanded: boolean;
    viewportHeight: number;
    viewportStableHeight: number;
    expand: () => void;
    close: () => void;
    onEvent: (eventType: string, callback: (params: { isStateStable: boolean }) => void) => void;
    offEvent: (eventType: string, callback: (params: any) => void) => void;
    platform: string;
  }

  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    }
  }
}

export {}; 