'use client';

import { useState } from 'react';
import { Icon } from '@iconify/react';
import { useTranslation } from '@/providers/i18n';
import { SafeArea } from '@/components/_layout/SafeArea';
import { PageContainer } from '@/components/_layout/PageContainer';
import { PageHeader } from '@/components/_layout/PageHeader';
import { useUserStore } from '@/store/useUserStore';
import { createBet, processGameResult } from '@/services/transactions';
import { GameType } from '@/types/game';
import './style.css';
import { GameField } from '../components/GameField';

type GameMode = 'bot' | 'player';
type BetType = 'tokens' | 'real';

export function RpsPage() {
  const { t } = useTranslation();
  const [betType, setBetType] = useState<BetType>('tokens');
  const [gameMode, setGameMode] = useState<GameMode>('bot');
  const [betAmount, setBetAmount] = useState<number>(100);
  const [gameStarted, setGameStarted] = useState(false);

  const updateUserBalance = useUserStore(state => state.updateBalance);

  const handleStartGame = async () => {
    try {
      const userBalance = useUserStore.getState().balance;
      
      if (betType === 'tokens' && userBalance < betAmount) {
        window.Telegram?.WebApp?.showPopup({
          title: t('common.error'),
          message: t('pages.games.rps.errors.insufficientBalance'),
          buttons: [{ type: 'ok' }]
        });
        return;
      }

      await createBet(betAmount, GameType.RPS);
      // Уменьшаем баланс на сумму ставки
      updateUserBalance(-betAmount);
      setGameStarted(true);
    } catch (error: unknown) {
      console.error('Error creating bet:', error);
      window.Telegram?.WebApp?.showPopup({
        title: t('common.error'),
        message: error instanceof Error ? error.message : t('pages.games.rps.errors.betFailed'),
        buttons: [{ type: 'ok' }]
      });
    }
  };

  const handleGameEnd = async (result: 'win' | 'lose' | 'draw') => {
    if (result !== 'draw') {
      try {
        await processGameResult(GameType.RPS, result, betAmount);
        
        if (result === 'win') {
          // При выигрыше добавляем удвоенную ставку
          updateUserBalance(betAmount * 2);
        }
        // При проигрыше ничего не делаем, так как баланс уже уменьшен
        
      } catch (error: unknown) {
        console.error('Error processing game result:', error);
        window.Telegram?.WebApp?.showPopup({
          title: t('common.error'),
          message: error instanceof Error ? error.message : t('pages.games.rps.errors.resultFailed'),
          buttons: [{ type: 'ok' }]
        });
      }
    }
    setGameStarted(false);
  };

  return (
    <SafeArea>
      <PageContainer>
        <PageHeader title={t('pages.games.rps.title')} />
        
        {!gameStarted ? (
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
        ) : (
          <GameField 
            betAmount={betAmount}
            onGameEnd={handleGameEnd}
          />
        )}
      </PageContainer>
    </SafeArea>
  );
} 