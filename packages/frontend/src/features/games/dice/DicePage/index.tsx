'use client';

import { useState } from 'react';
import { Icon } from '@iconify/react';
import { useTranslation } from '@/providers/i18n';
import { SafeArea } from '@/components/_layout/SafeArea';
import { PageContainer } from '@/components/_layout/PageContainer';
import { PageHeader } from '@/components/_layout/PageHeader';
import { useUserStore } from '@/store/useUserStore';
import { DiceGame } from '../components/DiceGame';
import './style.css';

type GameMode = 'bot' | 'player';
type BetType = 'tokens' | 'real';

export function DicePage() {
  const { t } = useTranslation();
  const [betType, setBetType] = useState<BetType>('tokens');
  const [gameMode, setGameMode] = useState<GameMode>('bot');
  const [betAmount, setBetAmount] = useState<number>(100);
  const [gameStarted, setGameStarted] = useState(false);

  const handleStartGame = () => {
    const userBalance = useUserStore.getState().balance;
    
    if (betType === 'tokens' && userBalance < betAmount) {
      window.Telegram?.WebApp?.showPopup({
        title: t('common.error'),
        message: t('pages.games.dice.errors.insufficientBalance'),
        buttons: [{ type: 'ok' }]
      });
      return;
    }

    setGameStarted(true);
  };

  const handleGameEnd = (result: 'win' | 'lose' | 'draw') => {
    // Здесь будет логика начисления выигрыша
    console.log('Game ended with result:', result);
    setGameStarted(false);
  };

  return (
    <SafeArea>
      <PageContainer>
        <PageHeader title={t('pages.games.dice.title')} />
        
        {!gameStarted ? (
          <div className="dice-page">
            {/* Выбор типа ставки */}
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

            {/* Выбор режима игры */}
            <div className="game-mode-selector">
              <button 
                className={`game-mode-button ${gameMode === 'bot' ? 'active' : ''}`}
                onClick={() => setGameMode('bot')}
              >
                <Icon icon="mdi:robot" />
                {t('pages.games.dice.playWithBot')}
              </button>
              <button 
                className={`game-mode-button ${gameMode === 'player' ? 'active' : ''}`}
                onClick={() => setGameMode('player')}
              >
                <Icon icon="mdi:account-multiple" />
                {t('pages.games.dice.playWithPlayer')}
              </button>
            </div>

            {/* Выбор суммы ставки */}
            <div className="bet-amount-selector">
              <h3>{t('pages.games.dice.betAmount')}</h3>
              <div className="bet-amount-controls">
                <button 
                  className="bet-control-button"
                  onClick={() => setBetAmount(prev => Math.max(0, prev - 100))}
                >
                  -
                </button>
                <div className="bet-amount">
                  <Icon 
                    icon={betType === 'tokens' ? "material-symbols:diamond-rounded" : "cryptocurrency:ton"} 
                    className="bet-currency-icon"
                  />
                  <span>{betAmount}</span>
                </div>
                <button 
                  className="bet-control-button"
                  onClick={() => setBetAmount(prev => prev + 100)}
                >
                  +
                </button>
              </div>
            </div>

            {/* Кнопка начала игры */}
            <button 
              className="start-game-button"
              onClick={handleStartGame}
            >
              {t('pages.games.dice.startGame')}
            </button>
          </div>
        ) : (
          <DiceGame 
            betAmount={betAmount}
            onGameEnd={handleGameEnd}
          />
        )}
      </PageContainer>
    </SafeArea>
  );
} 