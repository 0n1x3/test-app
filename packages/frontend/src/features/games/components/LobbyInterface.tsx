import React, { useState, useEffect } from 'react';
import { GameType } from '@test-app/shared';
import { useTranslation } from '@/providers/i18n';
import { Icon } from '@iconify/react';

interface Game {
  id: string;
  name: string;
  type: GameType;
  players: any[];
  betAmount: number;
  status: 'waiting' | 'playing' | 'finished';
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

  // Получаем объект Telegram из window
  const tg = window.Telegram?.WebApp;

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await fetch('https://test.timecommunity.xyz/api/games/list', {
          headers: {
            'Authorization': `tma ${tg?.initData}`
          }
        });
        const data = await response.json();
        if (data.games) {
          setGames(data.games);
        }
      } catch (error) {
        console.error('Error fetching games:', error);
      }
    };

    if (tg?.initData) {
      fetchGames();
    }
  }, [tg?.initData]);

  const handleCreate = async () => {
    if (loading || !tg?.initDataUnsafe?.user) return;
    
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

      const data = await response.json();
      
      if (data.success) {
        const { game } = data;
        setGames(prev => [...prev, game]);
        
        if (game.inviteLink) {
          setInviteLink(game.inviteLink);
          await navigator.clipboard.writeText(game.inviteLink);
          tg.showPopup({
            title: t('common.success'),
            message: t('game.inviteLinkCopied'),
            buttons: [{ type: 'ok' }]
          });
        }
      } else {
        throw new Error(data.error || 'Failed to create game');
      }
    } catch (error) {
      tg.showPopup({
        title: t('common.error'),
        message: t('game.createError'),
        buttons: [{ type: 'ok' }]
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`lobby-container ${className || ''}`}>
      <button 
        onClick={handleCreate}
        disabled={loading}
        className="create-game-btn"
      >
        <Icon icon="mdi:plus" />
        {loading ? t('common.loading') : t('game.create')}
      </button>
      
      <div className="games-list">
        {games.length > 0 ? (
          games.map(game => (
            <div key={game.id} className="game-item">
              <h3>{game.name || `Game #${game.id}`}</h3>
              <p>Type: {game.type}</p>
              <p>Players: {game.players.length}/2</p>
              <p>Bet: {game.betAmount}</p>
              {onJoin && (
                <button 
                  className="join-button"
                  onClick={() => onJoin(game.id)}
                >
                  {t('game.join')}
                </button>
              )}
            </div>
          ))
        ) : (
          <p>{t('game.noGames')}</p>
        )}
      </div>
    </div>
  );
}; 