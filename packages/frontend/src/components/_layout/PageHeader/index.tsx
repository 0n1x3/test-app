'use client';

import { Icon } from '@iconify/react';
import { useState } from 'react';
import './style.css';

interface PageHeaderProps {
  title: string;
}

export function PageHeader({ title }: PageHeaderProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="page-header">
      <h1>{title}</h1>
      <button 
        className="settings-button"
        onClick={() => setIsSettingsOpen(true)}
      >
        <Icon icon="tdesign:setting-1-filled" />
      </button>

      {isSettingsOpen && (
        <>
          <div className="overlay" onClick={() => setIsSettingsOpen(false)} />
          <div className="settings-popup">
            {/* ... содержимое настроек ... */}
          </div>
        </>
      )}
    </div>
  );
} 