'use client';

import { SafeArea } from '@/components/_layout/SafeArea';
import { PageContainer } from '@/components/_layout/PageContainer';
import { PageHeader } from '@/components/_layout/PageHeader';
import { Icon } from '@iconify/react';
import { useTranslation } from '@/providers/i18n';
import './style.css';

interface Tournament {
  id: string;
  title: string;
  game: string;
  gameIcon: string;
  participants: {
    current: number;
    max: number;
  };
  prize: {
    amount: number;
    token: string;
    tokenIcon: string;
  };
  startTime: string;
}

export function TournamentPage() {
  const { t } = useTranslation();

  const tournaments: Tournament[] = [
    {
      id: '1',
      title: t('pages.tournament.games.chess'),
      game: t('pages.home.games.chess'),
      gameIcon: 'solar:crown-minimalistic-linear',
      participants: {
        current: 14,
        max: 32
      },
      prize: {
        amount: 1000,
        token: 'TON',
        tokenIcon: 'ion:diamond'
      },
      startTime: '12:00'
    },
    {
      id: '2',
      title: t('pages.tournament.games.durak'),
      game: t('pages.home.games.durak'),
      gameIcon: 'mdi:cards-playing',
      participants: {
        current: 8,
        max: 16
      },
      prize: {
        amount: 500,
        token: 'USDT',
        tokenIcon: 'material-symbols:payments-rounded'
      },
      startTime: '15:30'
    },
    {
      id: '3',
      title: t('pages.tournament.games.dice'),
      game: t('pages.home.games.dice'),
      gameIcon: 'ion:dice-sharp',
      participants: {
        current: 24,
        max: 64
      },
      prize: {
        amount: 2500,
        token: 'TIME',
        tokenIcon: 'ion:time'
      },
      startTime: '18:00'
    }
  ];

  return (
    <SafeArea>
      <PageContainer>
        <PageHeader title={t('pages.tournament.title')} />
        <div className="tournaments-page">
          <div className="tournaments-list">
            {tournaments.map(tournament => (
              <div key={tournament.id} className="tournament-card">
                <div className="tournament-header">
                  <div className="tournament-game">
                    <Icon icon={tournament.gameIcon} className="game-icon" />
                    <span>{tournament.game}</span>
                  </div>
                  <div className="tournament-time">{tournament.startTime}</div>
                </div>
                
                <div className="tournament-title">{tournament.title}</div>
                
                <div className="tournament-info">
                  <div className="participants-info">
                    <Icon icon="solar:users-group-rounded-linear" />
                    <span>
                      {t('pages.tournament.participants')}: {tournament.participants.current}/{tournament.participants.max}
                    </span>
                  </div>
                  
                  <div className="prize-info">
                    <Icon icon={tournament.prize.tokenIcon} className="token-icon" />
                    <span className="prize-amount">
                      {t('pages.tournament.prize')}: {tournament.prize.amount} {tournament.prize.token}
                    </span>
                  </div>
                </div>
                
                <button className="join-button">
                  {t('pages.tournament.joinButton')}
                </button>
              </div>
            ))}
          </div>
        </div>
      </PageContainer>
    </SafeArea>
  );
} 