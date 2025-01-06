'use client';

import { SafeArea } from '@/components/_layout/SafeArea';
import { PageTransition } from '@/components/_layout/PageTransition';
import { PageContainer } from '@/components/_layout/PageContainer';
import { Icon } from '@iconify/react';
import { useState } from 'react';
import './style.css';

interface Game {
  id: string;
  title: string;
  icon: string;
  playCount?: number;
}

export function HomePage() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const games: Game[] = [
    {
      id: 'rps',
      title: 'Камень, ножницы, бумага',
      icon: 'mingcute:scissors-2-fill'
    },
    {
      id: 'checkers',
      title: 'Шашки',
      icon: 'mdi:checkers'
    },
    {
      id: 'chess',
      title: 'Шахматы',
      icon: 'fluent:chess-20-filled'
    },
    {
      id: 'durak',
      title: 'Дурак',
      icon: 'mdi:cards-playing'
    },
    {
      id: 'dice',
      title: 'Кубик',
      icon: 'ion:dice-sharp'
    }
  ];

  return (
    <SafeArea>
      <PageTransition>
        <PageContainer>
          <div className="page-header">
            <h1>Игры</h1>
            <button 
              className="settings-button"
              onClick={() => setIsSettingsOpen(true)}
            >
              <Icon icon="tdesign:setting-1-filled" />
            </button>
          </div>
          
          <div className="games-page">
            <div className="games-list">
              {games.map(game => (
                <div key={game.id} className="game-card">
                  <div className="game-info">
                    <Icon icon={game.icon} className="game-icon" />
                    <div className="game-details">
                      <div className="game-title">{game.title}</div>
                    </div>
                  </div>
                  <button className="play-button">
                    Играть
                  </button>
                </div>
              ))}
            </div>
          </div>

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
        </PageContainer>
      </PageTransition>
    </SafeArea>
  );
} 