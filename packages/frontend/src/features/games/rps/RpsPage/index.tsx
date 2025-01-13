'use client';

import { useState } from 'react';
import { Icon } from '@iconify/react';
import { useTranslation } from '@/providers/i18n';
import { SafeArea } from '@/components/_layout/SafeArea';
import { PageContainer } from '@/components/_layout/PageContainer';
import { PageHeader } from '@/components/_layout/PageHeader';
import { useUserStore } from '@/store/useUserStore';
import './style.css';

type GameMode = 'bot' | 'player';
type BetType = 'tokens' | 'real';

export function RpsPage() {
  const { t } = useTranslation();
  const [betType, setBetType] = useState<BetType>('tokens');
  const [gameMode, setGameMode] = useState<GameMode>('bot');
  const [betAmount, setBetAmount] = useState<number>(100);

  const handleStartGame = () => {
    // Проверяем баланс пользователя перед началом игры
    const userBalance = useUserStore.getState().balance;
    
    if (betType === 'tokens' && userBalance < betAmount) {
      window.Telegram?.WebApp?.showPopup({
        title: t('common.error'),
        message: t('pages.games.rps.errors.insufficientBalance'),
        buttons: [{ type: 'ok' }]
      });
      return;
    }

    // Здесь будет логика начала игры
    console.log('Starting game with:', {
      betType,
      gameMode,
      betAmount
    });
  };

  return (
    <SafeArea>
      <PageContainer>
        <PageHeader title={t('pages.games.rps.title')} />
        
        <div className="rps-page">
          {/* Выбор типа ставки */}
          <div className="bet-type-selector">
            <button 
              className={`bet-type-button ${betType === 'tokens' ? 'active' : ''}`}
              onClick={() => setBetType('tokens')}
            >
              <Icon icon="material-symbols:diamond-rounded" />
              {t('pages.games.rps.tokens')}
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
              {t('pages.games.rps.playWithBot')}
            </button>
            <button 
              className={`game-mode-button ${gameMode === 'player' ? 'active' : ''}`}
              onClick={() => setGameMode('player')}
            >
              <Icon icon="mdi:account-multiple" />
              {t('pages.games.rps.playWithPlayer')}
            </button>
          </div>

          {/* Выбор суммы ставки */}
          <div className="bet-amount-selector">
            <h3>{t('pages.games.rps.betAmount')}</h3>
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
            {t('pages.games.rps.startGame')}
          </button>
        </div>
      </PageContainer>
    </SafeArea>
  );
} 