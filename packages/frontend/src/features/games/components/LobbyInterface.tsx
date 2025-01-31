import React, { useState, useEffect } from 'react';
import { GameType } from '@test-app/shared';
import { useTranslation } from '@/providers/i18n';
import { Icon } from '@iconify/react';
import './LobbyInterface.css';
// Тип TelegramWebApp теперь доступен глобально через Window.Telegram

interface Game {
  _id?: string;  // MongoDB использует _id
  id?: string;   // Для обратной совместимости
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

const formatGameName = (name: string, id: string | undefined) => {
  if (!id) return name;
  const shortId = id.slice(-4); // Берем последние 4 символа ID
  return `${name} #${shortId}`;
};

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
      const response = await fetch(`https://test.timecommunity.xyz/api/games/active?type=${gameType}`);
      if (!response.ok) {
        throw new Error('Failed to fetch games');
      }
      const data = await response.json();
      console.log('Fetched games:', data); // Для отладки
      setGames(data.games || []);
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

  const handleCreateGame = async () => {
    try {
      if (!tg?.initData) return;
      setLoading(true);

      const response = await fetch('https://test.timecommunity.xyz/api/games/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: gameType,
          betAmount: 100,
          initData: tg.initData
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create game');
      }

      const data = await response.json();
      if (data.success) {
        await fetchGames(); // Обновляем список игр
        tg?.showPopup({
          title: t('common.success'),
          message: t('game.created'),
          buttons: [{ type: 'ok' }]
        });
      }
    } catch (error) {
      console.error('Error creating game:', error);
      tg?.showPopup({
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
      // Для мобильных устройств
      if (navigator.share) {
        await navigator.share({
          title: 'Присоединяйся к игре!',
          text: 'Нажми на ссылку, чтобы присоединиться:',
          url: game.inviteLink
        });
        return;
      }

      // Для остальных устройств
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
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
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
        // Если копирование не удалось, показываем ссылку
        tg?.showPopup({
          title: t('common.error'),
          message: game.inviteLink,
          buttons: [{ type: 'ok' }]
        });
      } finally {
        document.body.removeChild(textarea);
      }
    }
  };

  return (
    <div className={`lobby-container ${className || ''}`}>
      <button 
        className="create-game-btn"
        onClick={handleCreateGame}
        disabled={loading}
      >
        <Icon icon="material-symbols:add-circle-outline" />
        {t('game.create')}
      </button>

      <div className="games-list">
        {games.length > 0 ? (
          games.map(game => {
            const gameId = game._id || game.id;
            return (
              <div key={gameId} className="game-item">
                <div className="game-header">
                  <div className="game-name">
                    {formatGameName(game.name || 'Game', game._id || game.id)}
                  </div>
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
                    
                    {game.players.length < 2 && (
                      <button 
                        className="action-button join-game"
                        onClick={() => {
                          const gameId = game._id || game.id;
                          if (gameId) onJoin?.(gameId);
                        }}
                      >
                        <Icon icon="material-symbols:login" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
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