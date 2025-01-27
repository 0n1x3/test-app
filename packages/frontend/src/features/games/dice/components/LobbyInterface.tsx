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

  return (
    <div className="lobby-container">
      <button 
        onClick={onCreate}
        disabled={loading}
        className="create-game-btn"
      >
        {t('pages.games.createGame')}
      </button>
      
      <div className="games-list">
        {/* Здесь будет список активных игр */}
      </div>
    </div>
  );
}; 