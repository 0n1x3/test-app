'use client';

import Script from 'next/script'
import { useEffect } from 'react';
import '@/styles/globals.css';
import '@/styles/components.css';
import { TonProvider } from '@/providers/TonProvider';
import { setupViewport } from '@/utils/viewport';
import { setupFullscreen } from '@/utils/fullscreen';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    setupViewport();
    setupFullscreen();
  }, []);

  return (
    <html lang="en">
      <head>
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
      </head>
      <body>
        <TonProvider>{children}</TonProvider>
      </body>
    </html>
  );
}