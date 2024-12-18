'use client';

import { useTonConnectUI } from '@tonconnect/ui-react';

export function useTonConnect() {
  const [tonConnectUI] = useTonConnectUI();

  return {
    tonConnectUI,
  };
}