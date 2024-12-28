'use client';

import Script from 'next/script'
import { useEffect } from 'react';
import '@/styles/globals.css';
import '@/styles/components.css';
import { TonProvider } from '@/providers/TonProvider';
import { setupViewport } from '@/utils/viewport';
import Head from 'next/head';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (window.Telegram?.WebApp) {
      setupViewport();
    }
  }, []);

  return (
    <html lang="en">
      <head>
        <meta 
          name="viewport" 
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" 
        />
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