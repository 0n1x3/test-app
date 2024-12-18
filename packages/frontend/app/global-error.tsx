'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center">
          <h2>Что-то пошло не так!</h2>
          <button onClick={() => reset()}>Попробовать снова</button>
        </div>
      </body>
    </html>
  );
} 