'use client';

import Script from 'next/script'
import { useEffect, useState } from 'react';
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

// Глобальная переменная для отслеживания статуса загрузки Telegram WebApp
declare global {
  interface Window {
    telegramWebAppLoaded?: boolean;
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { fetchUserData } = useUserStore();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!document.getElementById('portal-root')) {
      const portalRoot = document.createElement('div');
      portalRoot.id = 'portal-root';
      document.body.appendChild(portalRoot);
    }
    
    // Проверяем доступность Telegram WebApp
    const initTelegramWebApp = () => {
      try {
        const tg = window.Telegram?.WebApp;
        if (tg) {
          console.log('Telegram WebApp загружен и инициализирован');
          window.telegramWebAppLoaded = true;
          
          // Вызываем метод ready() для сообщения клиенту Telegram, что приложение готово
          if (typeof tg.ready === 'function') {
            tg.ready();
            console.log('Вызван метод WebApp.ready()');
          }
          
          // Сохраняем данные пользователя в localStorage для доступа на других страницах
          if (tg.initDataUnsafe?.user) {
            localStorage.setItem('telegramWebAppUser', JSON.stringify(tg.initDataUnsafe.user));
            localStorage.setItem('telegramWebAppInitData', tg.initData || '');
            console.log('Данные Telegram WebApp сохранены в localStorage');
          }
          
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
              router.push(`/game/${gameId}`);
              // Сохраняем ID игры для дальнейшей обработки
              localStorage.setItem('pendingGameJoin', gameId);
            }
          }
          setIsLoading(false);
        } else {
          // В Telegram WebApp должен быть всегда доступен
          console.log('Ожидание загрузки Telegram WebApp...');
          setTimeout(initTelegramWebApp, 100);
        }
      } catch (error) {
        console.error('Ошибка при инициализации Telegram WebApp:', error);
        // Проверяем, есть ли у нас сохраненные данные пользователя
        const cachedUser = localStorage.getItem('telegramWebAppUser');
        if (cachedUser) {
          console.log('Используем кешированные данные Telegram WebApp');
          window.telegramWebAppLoaded = true;
          setIsLoading(false);
        } else if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
          console.log('Работа в режиме разработки без Telegram WebApp');
          window.telegramWebAppLoaded = true; // Симулируем загрузку
          setIsLoading(false);
        } else {
          setTimeout(initTelegramWebApp, 500);
        }
      }
    };
    
    // Запускаем проверку доступности Telegram WebApp
    initTelegramWebApp();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      fetchUserData();
    }
  }, [isLoading, fetchUserData]);

  // Показываем загрузочный экран, пока инициализируется Telegram WebApp
  if (isLoading) {
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
            onLoad={() => {
              console.log('Telegram WebApp скрипт загружен');
              // Инициализируем WebApp сразу после загрузки скрипта
              if (typeof window !== 'undefined') {
                window.telegramWebAppLoaded = false; // Сбрасываем флаг при загрузке скрипта
                setTimeout(() => {
                  // Даем немного времени для инициализации объекта WebApp
                  if (window.Telegram?.WebApp) {
                    window.telegramWebAppLoaded = true;
                    console.log('Telegram WebApp доступен после загрузки скрипта');
                  }
                }, 100);
              }
            }}
          />
        </head>
        <body>
          <div className="telegram-loading">
            <div className="loading-spinner"></div>
            <p>Загрузка Telegram WebApp...</p>
          </div>
        </body>
      </html>
    );
  }

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
          onLoad={() => {
            console.log('Telegram WebApp скрипт загружен');
            // Инициализируем WebApp сразу после загрузки скрипта
            if (typeof window !== 'undefined') {
              window.telegramWebAppLoaded = false; // Сбрасываем флаг при загрузке скрипта
              setTimeout(() => {
                // Даем немного времени для инициализации объекта WebApp
                if (window.Telegram?.WebApp) {
                  window.telegramWebAppLoaded = true;
                  console.log('Telegram WebApp доступен после загрузки скрипта');
                }
              }, 100);
            }
          }}
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