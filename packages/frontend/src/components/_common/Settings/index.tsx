'use client';

import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { useTranslation } from '@/providers/i18n';
import { useModal } from '@/providers/modal';
import type { Language } from '@/types/i18n';
import type { TelegramWebApp } from '@/types/telegram';
import { UserData } from '@/types/user';
import './style.css';

export function Settings() {
  const { setShowSettings } = useModal();
  const { t, language, setLanguage } = useTranslation();
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    const initUser = async () => {
      try {
        const webApp = window.Telegram?.WebApp;
        if (!webApp) return;

        const initData = (webApp as any).initData;
        console.log('Telegram Data:', initData);
        
        const response = await fetch('https://test.timecommunity.xyz/api/users/init', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            initData
          }),
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error details:', {
            status: response.status,
            statusText: response.statusText,
            body: errorText
          });
          return;
        }

        const data = await response.json();
        console.log('Response:', data);
        setUserData(data);
      } catch (error) {
        console.error('Error initializing user:', error);
      }
    };

    initUser();
  }, []);

  useEffect(() => {
    document.body.classList.add('settings-open');
    return () => {
      document.body.classList.remove('settings-open');
    };
  }, []);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setShowSettings(false);
    }
  };

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  return (
    <div className="settings-modal" onClick={handleBackdropClick}>
      <div className="settings-popup">
        <div className="settings-profile">
          <div className="profile-avatar">
            <Icon 
              icon="solar:user-circle-linear" 
              className="avatar-icon"
            />
          </div>
          <div className="profile-info">
            <div className="profile-name">
              {userData?.username || 'Пользователь'}
            </div>
            <div className="profile-id">
              ID: {userData?.telegramId || '---'}
            </div>
          </div>
          <button className="close-button" onClick={() => setShowSettings(false)}>
            <Icon icon="solar:close-circle-linear" />
          </button>
        </div>

        <div className="settings-divider" />

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
    </div>
  );
} 