'use client';

import { SafeArea } from '@/components/_layout/SafeArea';
import { PageTransition } from '@/components/_layout/PageTransition';
import { PageContainer } from '@/components/_layout/PageContainer';
import { Icon } from '@iconify/react';
import { useState } from 'react';
import './style.css';
import { PageHeader } from '@/components/_layout/PageHeader';

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
          <PageHeader title="Игры" />
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
        </PageContainer>
      </PageTransition>
    </SafeArea>
  );
} 