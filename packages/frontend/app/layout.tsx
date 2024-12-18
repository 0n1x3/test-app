import './globals.css';
import type { Metadata } from 'next';
import { TonProvider } from '@/providers/TonProvider';

export const metadata: Metadata = {
  title: 'Test App',
  description: 'Test App Description',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>
        <TonProvider>{children}</TonProvider>
      </body>
    </html>
  );
}