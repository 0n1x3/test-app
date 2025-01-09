'use client';

import { Icon } from '@iconify/react';
import { useModal } from '@/providers/modal';

export function SettingsButton() {
  const { setShowSettings } = useModal();

  return (
    <button className="settings-button" onClick={() => setShowSettings(true)}>
      <Icon icon="solar:settings-linear" />
    </button>
  );
} 