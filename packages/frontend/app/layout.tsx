import './globals.css';
import { TonProvider } from './providers/TonProvider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ backgroundColor: '#000000', margin: 0, padding: 0 }}>
        <TonProvider>
          {children}
        </TonProvider>
      </body>
    </html>
  );
}