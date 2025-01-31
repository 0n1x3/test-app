import React, { useState, useEffect } from 'react';
import { GameType } from '@test-app/shared';
import { useTranslation } from '@/providers/i18n';
import { Icon } from '@iconify/react';
import './LobbyInterface.css';
// Тип TelegramWebApp теперь доступен глобально через Window.Telegram

interface Game {
  id: string;
  name: string;
  type: GameType;
  players: any[];
  betAmount: number;
  status: 'waiting' | 'playing' | 'finished';
  inviteLink?: string;
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
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const tg = window.Telegram?.WebApp;

  const fetchGames = async () => {
    try {
      const response = await fetch('https://test.timecommunity.xyz/api/games/list');
      const data = await response.json();
      setGames(data.games.filter((g: Game) => g.type === gameType));
    } catch (error) {
      console.error('Error fetching games:', error);
    }
  };

  useEffect(() => {
    if (tg?.initData) {
      fetchGames();
      const interval = setInterval(fetchGames, 5000);
      return () => clearInterval(interval);
    }
  }, [tg?.initData]);

  const handleCreate = async () => {
    if (!tg || !tg.initDataUnsafe?.user?.id) {
      console.error('Telegram WebApp not initialized');
      return;
    }
    
    if (loading) return;
    
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
        setGames(prev => [...prev, data.game]);
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

  const copyInviteLink = async (game: Game) => {
    if (!game.inviteLink) return;

    try {
      await navigator.clipboard.writeText(game.inviteLink);
      tg?.showPopup({
        title: t('common.success'),
        message: t('game.inviteLinkCopied'),
        buttons: [{ type: 'ok' }]
      });
    } catch (error) {
      // Fallback для устройств без clipboard API
      const textarea = document.createElement('textarea');
      textarea.value = game.inviteLink;
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        tg?.showPopup({
          title: t('common.success'),
          message: t('game.inviteLinkCopied'),
          buttons: [{ type: 'ok' }]
        });
      } catch (e) {
        console.error('Fallback copy failed:', e);
        tg?.showPopup({
          title: t('common.error'),
          message: game.inviteLink,
          buttons: [{ type: 'ok' }]
        });
      }
      document.body.removeChild(textarea);
    }
  };

  return (
    <div className={`lobby-container ${className || ''}`}>
      <button 
        className="create-game-btn"
        onClick={handleCreate}
        disabled={loading}
      >
        <Icon icon="material-symbols:add-circle-outline" />
        {t('game.create')}
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
                  <span className="player-status">
                    {game.players.length === 2 
                      ? t('game.playerJoined')
                      : t('game.waitingForPlayers')
                    }
                  </span>
                </div>
                
                <div className="game-actions">
                  <button 
                    className="action-button copy-link"
                    onClick={() => copyInviteLink(game)}
                  >
                    <Icon icon="material-symbols:link" />
                  </button>
                  
                  {onJoin && game.players.length < 2 && (
                    <button 
                      className="action-button join-button"
                      onClick={() => onJoin(game.id)}
                    >
                      <Icon icon="material-symbols:login" />
                    </button>
                  )}
                </div>
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