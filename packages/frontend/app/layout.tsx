'use client';

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
      <body>
        <TonProvider>{children}</TonProvider>
      </body>
    </html>
  );
}