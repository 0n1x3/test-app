'use client';

import { useEffect, useState } from 'react';
import { Settings } from '@/components/_common/Settings';
import { useModal } from '@/providers/modal';

export function PortalContainer() {
  const { showSettings } = useModal();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      {showSettings && <Settings />}
    </>
  );
} 