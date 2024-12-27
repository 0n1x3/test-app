'use client';

import Script from 'next/script'
import { useEffect } from 'react';
import '@/styles/globals.css';
import '@/styles/components.css';
import { TonProvider } from '@/providers/TonProvider';
import { setupViewport } from '@/utils/viewport';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Инициализируем только после загрузки скрипта
    if (window.Telegram?.WebApp) {
      setupViewport();
    }
  }, []);

  return (
    <html lang="en">
      <head>
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
          onLoad={() => {
            if (window.Telegram?.WebApp) {
              setupViewport();
            }
          }}
        />
      </head>
      <body>
        <TonProvider>{children}</TonProvider>
      </body>
    </html>
  );
}