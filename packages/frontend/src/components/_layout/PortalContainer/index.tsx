'use client';

import { useEffect, useState } from 'react';
import { Settings } from '@/components/_common/Settings';
import { useModal } from '@/providers/modal';

export function PortalContainer() {
  const { showSettings } = useModal();
  const [mounted, setMounted] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Сначала монтируем
    setMounted(true);
    
    // Затем ждем следующего тика для применения стилей
    requestAnimationFrame(() => {
      setIsHydrated(true);
    });
  }, []);

  // Не рендерим до полной гидратации
  if (!mounted || !isHydrated) return null;

  return (
    <div className="portal-container">
      {showSettings && <Settings />}
    </div>
  );
} 