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
            <div className="settings-header">
              <h2>Настройки</h2>
              <button 
                className="close-button"
                onClick={() => setIsSettingsOpen(false)}
              >
                <Icon icon="solar:close-circle-linear" />
              </button>
            </div>

            <div className="settings-content">
              <div className="settings-group">
                <div className="settings-item">
                  <span>Музыка</span>
                  <label className="switch">
                    <input type="checkbox" />
                    <span className="slider" />
                  </label>
                </div>
                <div className="settings-item">
                  <span>Звуки</span>
                  <label className="switch">
                    <input type="checkbox" />
                    <span className="slider" />
                  </label>
                </div>
                <div className="settings-item">
                  <span>Вибрация</span>
                  <label className="switch">
                    <input type="checkbox" />
                    <span className="slider" />
                  </label>
                </div>
              </div>

              <div className="settings-group">
                <div className="settings-item">
                  <span>Тема</span>
                  <label className="switch">
                    <input type="checkbox" />
                    <span className="slider" />
                  </label>
                </div>
                <div className="settings-item">
                  <span>Язык</span>
                  <select className="language-select">
                    <option value="ru">Русский</option>
                    <option value="en">English</option>
                    <option value="zh">中文</option>
                  </select>
                </div>
              </div>

              <button className="add-to-home">
                <Icon icon="solar:home-add-linear" />
                Добавить на главный экран
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 