'use client';

import { SafeArea } from '@/components/_layout/SafeArea';
import { PageContainer } from '@/components/_layout/PageContainer';
import { PageHeader } from '@/components/_layout/PageHeader';
import { Icon } from '@iconify/react';
import { useTranslation } from '@/providers/i18n';
import './style.css';

interface Game {
  id: string;
  title: string;
  icon: string;
  playCount?: number;
}

export function HomePage() {
  const { t } = useTranslation();

  const games: Game[] = [
    {
      id: 'rps',
      title: t('pages.home.games.rps'),
      icon: 'mingcute:scissors-2-fill'
    },
    {
      id: 'dice',
      title: t('pages.home.games.dice'),
      icon: 'ion:dice-sharp'
    },
    {
      id: 'durak',
      title: t('pages.home.games.durak'),
      icon: 'mdi:cards-playing'
    },
    {
      id: 'checkers',
      title: t('pages.home.games.checkers'),
      icon: 'mdi:checkers'
    },
    {
      id: 'chess',
      title: t('pages.home.games.chess'),
      icon: 'fluent:chess-20-filled'
    },
    {
      id: 'backgammon',
      title: t('pages.home.games.backgammon'),
      icon: 'game-icons:backgammon'
    }
    
  ];

  return (
    <SafeArea>
      <PageContainer>
        <PageHeader title={t('pages.home.title')} />
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
                  {t('pages.home.playButton')}
                </button>
              </div>
            ))}
          </div>
        </div>
      </PageContainer>
    </SafeArea>
  );
} 