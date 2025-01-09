import { useEffect, useState } from 'react';

export function usePortal() {
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPortalRoot(document.getElementById('portal-root'));
  }, []);

  return portalRoot;
} 