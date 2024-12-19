import './globals.css';
import { TonProvider } from './providers/TonProvider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className="min-h-screen bg-gray-50">
        <TonProvider>
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
        </TonProvider>
      </body>
    </html>
  );
}