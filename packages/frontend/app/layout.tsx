'use client';

import Script from 'next/script'
import { useEffect } from 'react';
import { Inter, Roboto_Mono } from 'next/font/google';
import { usePathname, useRouter } from 'next/navigation';
import '@/styles/globals.css';
import '@/styles/base/components.css';
import { TonProvider } from '@/providers/ton';
import { setupViewport } from '@/utils/viewport';
import { BottomNav } from '@/components/_layout/BottomNav';
import { I18nProvider } from '@/providers/i18n';
import { ModalProvider } from '@/providers/modal';
import { PortalContainer } from '@/components/_layout/PortalContainer';
import { useUserStore } from '@/store/useUserStore';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });
const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { fetchUserData } = useUserStore();
  const router = useRouter();

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

      // Обработка параметров запуска
      const startParam = tg.initDataUnsafe && 'start_param' in tg.initDataUnsafe 
        ? (tg.initDataUnsafe as any).start_param 
        : undefined;
      console.log('Start param:', startParam);
      
      if (startParam && startParam.startsWith('game_')) {
        // Получаем ID игры и перенаправляем на страницу игры в режиме лобби
        const gameId = startParam.substring(5);
        console.log('Redirecting to game:', gameId);
        
        // Если пользователь уже на странице игры, просто открываем игру
        if (pathname && pathname.includes('/games/dice')) {
          // В этом случае нужно внедрить функционал открытия игры через событие
          // Можно использовать localStorage или глобальное состояние
          localStorage.setItem('pendingGameJoin', gameId);
          window.location.reload(); // Перезагружаем страницу для применения изменений
        } else {
          // Иначе перенаправляем на страницу игры
          router.push(`/games/dice`);
          // Сохраняем ID игры для дальнейшей обработки
          localStorage.setItem('pendingGameJoin', gameId);
        }
      }
    }
  }, []);

  useEffect(() => {
    fetchUserData();
  }, []);

  return (
    <html lang="en" data-platform="mobile" data-fullscreen="true" className={`${inter.className} ${robotoMono.variable}`}>
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
      <body data-route={pathname}>
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
              <Toaster position="top-center" />
            </ModalProvider>
          </TonProvider>
        </I18nProvider>
        <div id="portal-root" />
      </body>
    </html>
  );
}