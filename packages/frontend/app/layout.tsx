'use client';

import Script from 'next/script'
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import '@/styles/globals.css';
import '@/styles/components.css';
import { TonProvider } from '@/providers/TonProvider';
import { setupViewport } from '@/utils/viewport';
import { AnimatePresence } from 'framer-motion';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      // Устанавливаем корректную высоту вьюпорта
      document.documentElement.style.setProperty(
        '--tg-viewport-height',
        `${tg.viewportHeight}px`
      );
      document.documentElement.style.setProperty(
        '--tg-viewport-stable-height',
        `${tg.viewportStableHeight}px`
      );
      
      // Проверяем платформу
      const isMobileApp = !['macos', 'windows', 'linux'].includes(tg.platform);
      if (isMobileApp) {
        document.documentElement.style.setProperty('--tg-header-height', '72px');
      } else {
        document.documentElement.style.setProperty('--tg-header-height', '32px');
      }
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
        <TonProvider>
          <AnimatePresence mode="wait" initial={false} onExitComplete={() => window.scrollTo(0, 0)}>
            <div key={pathname} style={{ width: '100%', height: '100%' }}>
              {children}
            </div>
          </AnimatePresence>
        </TonProvider>
      </body>
    </html>
  );
}