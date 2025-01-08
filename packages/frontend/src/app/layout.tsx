export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>
        <div id="portal-root" />
        {children}
      </body>
    </html>
  );
} 