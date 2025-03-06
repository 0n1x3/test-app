import * as React from 'react';
import * as ReactDOM from 'react-dom';

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
      start_param?: string;
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
    platform: string;
    requestFullscreen: () => void;
    exitFullscreen: () => void;
    openLink: (url: string) => void;
    openTelegramLink: (url: string) => void;
    showPopup: (params: {
      title?: string;
      message: string;
      buttons?: Array<{
        id?: string;
        type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
        text?: string;
      }>;
    }) => Promise<void>;
  }

  interface Window {
    React: typeof React;
    ReactDOM: typeof ReactDOM;
    telegramWebAppLoaded?: boolean;
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
} 