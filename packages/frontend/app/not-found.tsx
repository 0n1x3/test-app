'use client';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h2 className="text-2xl font-bold mb-4">404 - Страница не найдена</h2>
      <a href="/" className="text-blue-500 hover:text-blue-700 underline">
        На главную
      </a>
    </div>
  );
}