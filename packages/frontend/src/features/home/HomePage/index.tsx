'use client';

import { SafeArea } from '@/components/_layout/SafeArea';
import { PageTransition } from '@/components/_layout/PageTransition';
import { PageContainer } from '@/components/_layout/PageContainer';
import { Icon } from '@iconify/react';
import './style.css';

interface Game {
  id: string;
  title: string;
  icon: string;
  playCount?: number;
}

export function HomePage() {
  const games: Game[] = [
    {
      id: 'rps',
      title: 'Камень, ножницы, бумага',
      icon: 'solar:hand-linear',
      playCount: 34
    },
    {
      id: 'checkers',
      title: 'Шашки',
      icon: 'solar:squares-four-linear',
      playCount: 12
    },
    {
      id: 'chess',
      title: 'Шахматы',
      icon: 'solar:crown-linear',
      playCount: 28
    },
    {
      id: 'durak',
      title: 'Дурак',
      icon: 'solar:cards-linear',
      playCount: 45
    },
    {
      id: 'dice',
      title: 'Кубик',
      icon: 'solar:widget-5-linear',
      playCount: 67
    }
  ];

  return (
    <SafeArea>
      <PageTransition>
        <PageContainer>
          <div className="page-header">
            <h1>Игры</h1>
          </div>
          
          <div className="games-page">
            <div className="games-list">
              {games.map(game => (
                <div key={game.id} className="game-card">
                  <div className="game-info">
                    <Icon icon={game.icon} className="game-icon" />
                    <div className="game-details">
                      <div className="game-title">{game.title}</div>
                      {game.playCount && (
                        <div className="game-plays">
                          {game.playCount} Play passes
                        </div>
                      )}
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