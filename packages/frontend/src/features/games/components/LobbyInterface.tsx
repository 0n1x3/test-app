import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/providers/i18n';

interface LobbyInterfaceProps {
  gameType: 'dice' | 'rps';
  onJoin?: (gameId: string) => void;
  onCreate?: () => void;
}

export const LobbyInterface: React.FC<LobbyInterfaceProps> = ({ 
  gameType,
  onJoin,
  onCreate
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [games, setGames] = useState<string[]>([]);

  const handleCreate = async () => {
    setLoading(true);
    try {
      await onCreate?.();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lobby-container">
      <button 
        onClick={handleCreate}
        disabled={loading}
        className="create-game-btn"
      >
        {loading ? t('common.loading') : t('pages.games.createGame')}
      </button>
      
      <div className="games-list">
        {games.length === 0 && (
          <div className="no-games">
            {t('pages.games.noActiveGames')}
          </div>
        )}
      </div>
    </div>
  );
}; 