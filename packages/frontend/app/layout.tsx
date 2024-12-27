'use client';

import { useEffect } from 'react';
import '@/styles/globals.css';
import '@/styles/components.css';
import { TonProvider } from '@/providers/TonProvider';
import { setupViewport } from '@/utils/viewport';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    setupViewport();
  }, []);

  return (
    <html lang="en">
      <body>
        <TonProvider>{children}</TonProvider>
      </body>
    </html>
  );
}