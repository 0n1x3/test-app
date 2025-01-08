'use client';

import { Icon } from '@iconify/react';
import { useState, useEffect } from 'react';
import './style.css';

export function Settings() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('ru');

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('settings-open');
    } else {
      document.body.classList.remove('settings-open');
    }
  }, [isOpen]);

  return (
    <>
      <button 
        className="settings-button"
        onClick={() => setIsOpen(true)}
      >
        <Icon icon="tdesign:setting-1-filled" />
      </button>

      {isOpen && (
        <>
          <div className="overlay" onClick={() => setIsOpen(false)} />
          <div className="settings-popup">
            <div className="settings-header">
              <h2>Настройки</h2>
              <button 
                className="close-button"
                onClick={() => setIsOpen(false)}
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
                  <span>Виброотклик</span>
                  <label className="switch">
                    <input type="checkbox" />
                    <span className="slider" />
                  </label>
                </div>
              </div>

              <div className="settings-group">
                <div className="settings-item">
                  <span>Язык</span>
                  <div className="language-buttons">
                    <button 
                      className={`lang-button ${currentLang === 'ru' ? 'active' : ''}`}
                      onClick={() => setCurrentLang('ru')}
                    >
                      RU
                    </button>
                    <button 
                      className={`lang-button ${currentLang === 'en' ? 'active' : ''}`}
                      onClick={() => setCurrentLang('en')}
                    >
                      EN
                    </button>
                    <button 
                      className={`lang-button ${currentLang === 'zh' ? 'active' : ''}`}
                      onClick={() => setCurrentLang('zh')}
                    >
                      中文
                    </button>
                  </div>
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
    </>
  );
} 