'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '@iconify/react';
import { useTranslation } from '@/providers/i18n';
import { usePortal } from '@/hooks/usePortal';
import type { Language } from '@/types/i18n';
import './style.css';

export function Settings() {
  const [isOpen, setIsOpen] = useState(false);
  const { t, language, setLanguage } = useTranslation();
  const portalRoot = usePortal();

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('settings-open');
    } else {
      document.body.classList.remove('settings-open');
    }
  }, [isOpen]);

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      <button className="settings-button" onClick={() => setIsOpen(true)}>
        <Icon icon="solar:settings-linear" />
      </button>

      {isOpen && portalRoot && createPortal(
        <div className="settings-modal">
          <div className="settings-popup">
            <div className="settings-header">
              <h2>{t('settings.title')}</h2>
              <button className="close-button" onClick={handleClose}>
                <Icon icon="solar:close-circle-linear" />
              </button>
            </div>

            <div className="settings-content">
              <div className="settings-group">
                <div className="settings-item">
                  <span>{t('settings.music')}</span>
                  <label className="switch">
                    <input type="checkbox" />
                    <span className="slider" />
                  </label>
                </div>
                <div className="settings-item">
                  <span>{t('settings.sounds')}</span>
                  <label className="switch">
                    <input type="checkbox" />
                    <span className="slider" />
                  </label>
                </div>
                <div className="settings-item">
                  <span>{t('settings.vibration')}</span>
                  <label className="switch">
                    <input type="checkbox" />
                    <span className="slider" />
                  </label>
                </div>
              </div>

              <div className="settings-group">
                <div className="settings-item">
                  <span>{t('settings.language')}</span>
                  <div className="language-buttons">
                    <button 
                      className={`lang-button ${language === 'ru' ? 'active' : ''}`}
                      onClick={() => handleLanguageChange('ru')}
                    >
                      RU
                    </button>
                    <button 
                      className={`lang-button ${language === 'en' ? 'active' : ''}`}
                      onClick={() => handleLanguageChange('en')}
                    >
                      EN
                    </button>
                    <button 
                      className={`lang-button ${language === 'zh' ? 'active' : ''}`}
                      onClick={() => handleLanguageChange('zh')}
                    >
                      中文
                    </button>
                  </div>
                </div>
              </div>

              <button className="add-to-home">
                <Icon icon="solar:home-add-linear" />
                {t('settings.addToHome')}
              </button>
            </div>
          </div>
        </div>,
        portalRoot
      )}
    </>
  );
} 