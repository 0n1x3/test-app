interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    user?: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
      language_code?: string;
      photo_url?: string;
      is_premium?: boolean;
    };
    auth_date: number;
    hash: string;
    query_id?: string;
  };
  expand: () => void;
  ready: () => void;
  close: () => void;
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  enableClosingConfirmation: () => void;
  disableClosingConfirmation: () => void;
  onEvent: (eventType: string, eventHandler: Function) => void;
  offEvent: (eventType: string, eventHandler: Function) => void;
  MainButton: any;
  BackButton: any;
  platform: string;
  version: string;
  colorScheme: string;
  themeParams: any;
  isClosingConfirmationEnabled: boolean;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

export { TelegramWebApp }; 