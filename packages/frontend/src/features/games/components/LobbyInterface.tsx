import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/providers/i18n';
import { Icon } from '@iconify/react';
import './LobbyInterface.css';
import { GameCard } from './GameCard';
import { GameType } from '@/types/game';
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
  gameType: GameType;
  onJoin: (gameId: string) => void;
  onCreate?: () => void;
}

const formatGameName = (name: string, id: string | undefined) => {
  if (!id) return name;
  const shortId = id.slice(-4); // Берем последние 4 символа ID
  return `${name} #${shortId}`;
};

export function LobbyInterface({ 
  gameType, 
  onJoin,
  onCreate
}: LobbyInterfaceProps) {
  const { t } = useTranslation();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const tg = window.Telegram?.WebApp;

  useEffect(() => {
    fetchGames();
    // Устанавливаем интервал для обновления списка игр
    const interval = setInterval(fetchGames, 10000);
    return () => clearInterval(interval);
  }, [gameType]);

  const fetchGames = async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://test.timecommunity.xyz/api/games/active?type=${gameType}`);
      if (!response.ok) {
        throw new Error('Failed to fetch games');
      }
      const data = await response.json();
      console.log('Fetched games:', data);
      setGames(data.games || []);
    } catch (error) {
      console.error('Error fetching games:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const handleJoinGame = async (gameId: string) => {
    setTimeout(() => {
      onJoin(gameId);
    }, 0);
  };

  const copyGameLink = (gameId: string) => {
    try {
      const link = `https://t.me/neometria_bot?startapp=game_${gameId}`;
      navigator.clipboard.writeText(link);
      
      setTimeout(() => {
        window.Telegram?.WebApp?.showPopup({
          title: 'Успех',
          message: 'Ссылка скопирована в буфер обмена',
          buttons: [{ type: 'ok' }]
        });
      }, 0);
    } catch (error) {
      console.error('Ошибка копирования ссылки:', error);
    }
  };

  return (
    <div className="lobby-interface">
      <div className="active-games-list">
        {loading ? (
          <div className="loading-indicator">
            <span className="loading-spinner"></span>
            <p>Загрузка игр...</p>
          </div>
        ) : games.length > 0 ? (
          games.map((game) => (
            <GameCard
              key={game._id || `game-${Math.random()}`}
              game={game}
              onJoin={() => {
                if (game._id) {
                  onJoin(game._id);
                }
              }}
            />
          ))
        ) : (
          <div className="no-games-message">
            <p>Нет активных игр</p>
            <p className="no-games-hint">Создайте свою игру или подождите, пока другие игроки создадут игры</p>
          </div>
        )}
      </div>
    </div>
  );
} 