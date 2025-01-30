import React, { useState, useEffect } from 'react';
import { GameType } from '@test-app/shared';
import { useTranslation } from '@/providers/i18n';
import { Icon } from '@iconify/react';
import './LobbyInterface.css';

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
      // Обновляем список каждые 5 секунд
      const interval = setInterval(fetchGames, 5000);
      return () => clearInterval(interval);
    }
  }, [tg?.initData]);

  const handleCreate = async () => {
    if (loading || !onCreate) return;
    setLoading(true);
    try {
      await onCreate();
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
              <div className="game-header">
                <div className="game-name">{game.name || `Game #${game.id}`}</div>
                <div className="bet-amount">
                  <Icon icon="material-symbols:diamond-rounded" />
                  {game.betAmount}
                </div>
              </div>
              
              <div className="game-info">
                <div className="game-players">
                  <Icon icon="mdi:account-multiple" />
                  {game.players.length}/2
                </div>
                
                {onJoin && (
                  <button 
                    className="join-button"
                    onClick={() => onJoin(game.id)}
                  >
                    {t('game.join')}
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="no-games">
            <Icon icon="mdi:gamepad-variant-outline" className="no-games-icon" />
            <p>{t('game.noGames')}</p>
          </div>
        )}
      </div>
    </div>
  );
}; 