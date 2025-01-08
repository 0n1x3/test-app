'use client';

import Script from 'next/script'
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import '@/styles/globals.css';
import '@/styles/base/components.css';
import { TonProvider } from '@/providers/ton';
import { setupViewport } from '@/utils/viewport';
import { AnimatePresence } from 'framer-motion';
import { BottomNav } from '@/components/_layout/BottomNav';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      setupViewport();
      
      const isMobileApp = !['macos', 'windows', 'linux'].includes(tg.platform);
      document.documentElement.dataset.platform = isMobileApp ? 'mobile' : 'desktop';
      
      // Отключаем зум
      document.addEventListener('touchstart', (e) => {
        if (e.touches.length > 1) {
          e.preventDefault();
        }
      }, { passive: false });
    }
  }, []);

  return (
    <html lang="en" data-platform="desktop">
      <head>
        <meta 
          name="viewport" 
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" 
        />
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
      </head>
      <body>
        <TonProvider>
          <div className="app-container">
            <AnimatePresence mode="wait" initial={false} onExitComplete={() => window.scrollTo(0, 0)}>
              <div key={pathname} style={{ width: '100%', height: '100%' }}>
                {children}
              </div>
            </AnimatePresence>
            <BottomNav />
          </div>
        </TonProvider>
      </body>
    </html>
  );
}