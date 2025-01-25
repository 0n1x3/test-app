'use client';

import { useRouter } from 'next/navigation';
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
  route: string;
  isActive?: boolean;
}

export function HomePage() {
  const { t } = useTranslation();
  const router = useRouter();

  const games: Game[] = [
    {
      id: 'rps',
      title: t('pages.home.games.rps'),
      icon: 'mingcute:scissors-2-fill',
      route: '/games/rps',
      isActive: true
    },
    {
      id: 'dice',
      title: t('pages.home.games.dice'),
      icon: 'ion:dice-sharp',
      route: '/games/dice',
      isActive: true
    },
    {
      id: 'durak',
      title: t('pages.home.games.durak'),
      icon: 'mdi:cards-playing',
      route: '/games/durak',
      isActive: false
    },
    {
      id: 'checkers',
      title: t('pages.home.games.checkers'),
      icon: 'mdi:checkerboard',
      route: '/games/checkers',
      isActive: false
    },
    {
      id: 'chess',
      title: t('pages.home.games.chess'),
      icon: 'mdi:chess-king',
      route: '/games/chess',
      isActive: false
    },
    {
      id: 'backgammon',
      title: t('pages.home.games.backgammon'),
      icon: 'game-icons:backgammon',
      route: '/games/backgammon',
      isActive: false
    }
  ];

  const handlePlayClick = (game: Game) => {
    if (game.isActive) {
      router.push(game.route);
    }
  };

  return (
    <SafeArea>
      <PageContainer>
        <PageHeader title={t('pages.home.title')} />
        <div className="games-page">
          <div className="games-list">
            {games.map(game => (
              <div key={game.id} className={`game-card ${!game.isActive ? 'inactive' : ''}`}>
                <div className="game-info">
                  <Icon icon={game.icon} className="game-icon" />
                  <div className="game-details">
                    <div className="game-title">{game.title}</div>
                    {!game.isActive && (
                      <div className="coming-soon">{t('pages.home.comingSoon')}</div>
                    )}
                  </div>
                </div>
                <button 
                  className={`play-button ${!game.isActive ? 'disabled' : ''}`}
                  onClick={() => handlePlayClick(game)}
                  disabled={!game.isActive}
                >
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