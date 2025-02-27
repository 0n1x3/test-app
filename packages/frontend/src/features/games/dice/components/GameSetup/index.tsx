'use client';

import React from 'react';
import { Icon } from '@iconify/react';
import { useTranslation } from '@/providers/i18n';
import './style.css';

type BetType = 'tokens' | 'real';
type GameMode = 'bot' | 'player';

interface GameSetupProps {
  betType: BetType;
  setBetType: (type: BetType) => void;
  gameMode: GameMode;
  setGameMode: (mode: GameMode) => void;
  betAmount: number;
  setBetAmount: React.Dispatch<React.SetStateAction<number>>;
  onStartGame: () => void;
}

export const GameSetup = React.memo(function GameSetup({
  betType,
  setBetType,
  gameMode,
  setGameMode,
  betAmount,
  setBetAmount,
  onStartGame
}: GameSetupProps) {
  const { t } = useTranslation();

  return (
    <div className="dice-setup">
      <div className="bet-type-selector">
        <button
          className={`bet-type-button ${betType === 'tokens' ? 'active' : ''}`}
          onClick={() => setBetType('tokens')}
        >
          <Icon icon="material-symbols:diamond-rounded" />
          {t('pages.games.dice.tokens')}
        </button>
        <button
          className={`bet-type-button ${betType === 'real' ? 'active' : ''}`}
          onClick={() => setBetType('real')}
        >
          <Icon icon="cryptocurrency:ton" />
          TON
        </button>
      </div>

      <div className="game-mode-selector">
        <button
          className={`game-mode-button ${gameMode === 'bot' ? 'active' : ''}`}
          onClick={() => setGameMode('bot')}
        >
          <Icon icon="mdi:robot" className="mode-icon" />
          {t('pages.games.dice.playWithBot')}
        </button>
        <button
          className={`game-mode-button ${gameMode === 'player' ? 'active' : ''}`}
          onClick={() => setGameMode('player')}
        >
          <Icon icon="mdi:account-multiple" className="mode-icon" />
          {t('pages.games.dice.playWithPlayer')}
        </button>
      </div>

      <div className="bet-amount-selector">
        <div className="bet-amount-label">
          {t('pages.games.dice.betAmount')}
        </div>
        <div className="bet-amount-controls">
          <button
            className="bet-control-button"
            onClick={() => setBetAmount(prev => Math.max(100, prev - 100))}
          >
            -
          </button>
          <div className="bet-amount">
            <Icon 
              icon={betType === 'tokens' ? "material-symbols:diamond-rounded" : "cryptocurrency:ton"} 
              className="bet-currency-icon" 
            />
            {betAmount}
          </div>
          <button
            className="bet-control-button"
            onClick={() => setBetAmount(prev => prev + 100)}
          >
            +
          </button>
        </div>
      </div>

      <button className="start-game-button" onClick={onStartGame}>
        {t('pages.games.dice.startGame')}
      </button>
    </div>
  );
}); 