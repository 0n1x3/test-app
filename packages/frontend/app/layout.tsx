import './globals.css';
import { Metadata } from 'next';

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
      <body>{children}</body>
    </html>
  );
}