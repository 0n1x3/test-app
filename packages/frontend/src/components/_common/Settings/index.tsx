'use client';

import { Icon } from '@iconify/react';
import { useState } from 'react';
import './style.css';
import { useTranslation } from '@/providers/i18n';
import type { Language } from '@/types/i18n';

export function Settings() {
  const [isOpen, setIsOpen] = useState(false);
  const { t, language, setLanguage } = useTranslation();

  const toggleSettings = () => {
    setIsOpen(!isOpen);
    document.body.classList.toggle('settings-open');
  };

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  return (
    <>
      <button className="settings-button" onClick={toggleSettings}>
        <Icon icon="solar:settings-linear" />
      </button>

      {isOpen && (
        <>
          <div className="settings-overlay" />
          <div className="settings-popup">
            <div className="settings-header">
              <h2>{t('settings.title')}</h2>
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
        </>
      )}
    </>
  );
} 