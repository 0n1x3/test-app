import './globals.css';
import { TonProvider } from './providers/TonProvider';
import { ConnectionStatus } from '@/components/ConnectionStatus';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className="min-h-screen bg-gray-50">
        <TonProvider>
          <ConnectionStatus />
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
        </TonProvider>
      </body>
    </html>
  );
}