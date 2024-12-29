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
      setupViewport();
      
      document.documentElement.style.setProperty(
        '--tg-viewport-height',
        `${tg.viewportHeight}px`
      );
      document.documentElement.style.setProperty(
        '--tg-viewport-stable-height',
        `${tg.viewportStableHeight}px`
      );
    }
  }, []);

  return (
    <html lang="en">
      <body>
        <TonProvider>
          <AnimatePresence mode="wait" initial={false}>
            <div key={pathname}>
              {children}
            </div>
          </AnimatePresence>
        </TonProvider>
      </body>
    </html>
  );
}