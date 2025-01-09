'use client';

import { useEffect, useState } from 'react';
import { Settings } from '@/components/_common/Settings';
import { useModal } from '@/providers/modal';

export function PortalContainer() {
  const { showSettings } = useModal();
  const [mounted, setMounted] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Добавляем небольшую задержку для гарантии загрузки стилей
    const timer = setTimeout(() => {
      setIsHydrated(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Не рендерим ничего до полной гидратации
  if (!mounted || !isHydrated) return null;

  return (
    <>
      {showSettings && <Settings />}
    </>
  );
} 