'use client';

import Script from 'next/script'
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import '@/styles/globals.css';
import '@/styles/base/components.css';
import { TonProvider } from '@/providers/ton';
import { setupViewport } from '@/utils/viewport';
import { BottomNav } from '@/components/_layout/BottomNav';
import { I18nProvider } from '@/providers/i18n';
import { ModalProvider } from '@/providers/modal';
import { PortalContainer } from '@/components/_layout/PortalContainer';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  useEffect(() => {
    if (!document.getElementById('portal-root')) {
      const portalRoot = document.createElement('div');
      portalRoot.id = 'portal-root';
      document.body.appendChild(portalRoot);
    }
    
    const tg = window.Telegram?.WebApp;
    if (tg) {
      setupViewport();
      
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
        <I18nProvider>
          <TonProvider>
            <ModalProvider>
              <div className="app-container">
                <div key={pathname} style={{ width: '100%', height: '100%' }}>
                  {children}
                </div>
                <BottomNav />
              </div>
              <PortalContainer />
            </ModalProvider>
          </TonProvider>
        </I18nProvider>
        <div id="portal-root" />
      </body>
    </html>
  );
}