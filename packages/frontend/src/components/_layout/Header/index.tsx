'use client';

import { useState } from 'react';
import { Icon } from '@iconify/react';
import './style.css';

export function Header() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="header">
      <h1>Neometria</h1>
      <button 
        className="settings-button"
        onClick={() => setIsSettingsOpen(true)}
      >
        <Icon icon="solar:settings-bold" />
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