'use client';

import Script from 'next/script'
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import '@/styles/globals.css';
import '@/styles/base/components.css';
import { TonProvider } from '@/providers/ton';
import { setupViewport } from '@/utils/viewport';
import { AnimatePresence, motion } from 'framer-motion';
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
      
      // Отключаем зум
      document.addEventListener('touchstart', (e) => {
        if (e.touches.length > 1) {
          e.preventDefault();
        }
      }, { passive: false });
    }
  }, []);

  return (
    <html lang="en" data-platform="mobile" data-fullscreen="true">
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
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={pathname}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ 
                  duration: 0.2,
                  ease: 'easeInOut'
                }}
                style={{
                  width: '100%',
                  height: '100%',
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: 0
                }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
            <BottomNav />
          </div>
        </TonProvider>
      </body>
    </html>
  );
}