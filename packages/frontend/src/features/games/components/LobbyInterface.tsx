import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/providers/i18n';
import { Icon } from '@iconify/react';

interface Game {
  id: string;
  creator: {
    name: string;
    id: string;
  };
  betAmount: number;
  createdAt: number;
}

interface LobbyInterfaceProps {
  gameType: 'dice' | 'rps';
  onJoin?: (gameId: string) => void;
  onCreate?: () => void;
  className?: string;
}

export const LobbyInterface: React.FC<LobbyInterfaceProps> = ({ 
  gameType,
  onJoin,
  onCreate,
  className
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [games, setGames] = useState<Game[]>([]);
  const [inviteLink, setInviteLink] = useState<string>('');

  const handleCreate = async () => {
    const tg = window.Telegram?.WebApp;
    if (!tg || !tg.initDataUnsafe?.user) return;

    setLoading(true);
    try {
      const response = await fetch('https://test.timecommunity.xyz/api/games/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `tma ${tg.initData}`
        },
        body: JSON.stringify({ 
          gameType,
          creatorId: tg.initDataUnsafe.user.id,
          betAmount: 100
        }),
      });

      const { gameId, inviteLink } = await response.json();
      setInviteLink(inviteLink);

      await tg.showPopup({
        title: t('pages.games.inviteFriends'),
        message: t('pages.games.waitingPlayers'),
        buttons: [{ type: 'default', text: t('pages.games.copyLink') }]
      });

      navigator.clipboard.writeText(inviteLink);
    } catch (error) {
      tg.showPopup({
        title: t('common.error'),
        message: error instanceof Error ? error.message : 'Unknown error',
        buttons: [{ type: 'ok' }]
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Здесь должен быть запрос для получения списка активных игр
    const fetchGames = async () => {
      try {
        const response = await fetch(`https://test.timecommunity.xyz/api/games?type=${gameType}`);
        if (!response.ok) throw new Error('Failed to fetch games');
        const data = await response.json();
        setGames(data.games);
      } catch (error) {
        console.error('Error fetching games:', error);
      }
    };

    fetchGames();
    const interval = setInterval(fetchGames, 5000); // Обновляем список каждые 5 секунд
    return () => clearInterval(interval);
  }, [gameType]);

  return (
    <div className={`lobby-container ${className || ''}`}>
      <button 
        onClick={handleCreate}
        disabled={loading}
        className="create-game-btn"
      >
        <Icon icon="mdi:plus" />
        {loading ? t('common.loading') : t('pages.games.createGame')}
      </button>
      
      <div className="games-list">
        {games.length === 0 ? (
          <div className="no-games">
            {t('pages.games.noActiveGames')}
          </div>
        ) : (
          games.map(game => (
            <div key={game.id} className="game-item">
              <div className="game-info">
                <div className="player-name">{game.creator.name}</div>
                <div className="bet-info">
                  <Icon icon="material-symbols:diamond-rounded" />
                  {game.betAmount}
                </div>
              </div>
              <button 
                className="join-button"
                onClick={() => onJoin?.(game.id)}
              >
                {t('pages.games.join')}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}; 