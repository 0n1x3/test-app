'use client';

import { useState } from 'react';
import { Icon } from '@iconify/react';
import { useTranslation } from '@/providers/i18n';
import { SafeArea } from '@/components/_layout/SafeArea';
import { PageContainer } from '@/components/_layout/PageContainer';
import { PageHeader } from '@/components/_layout/PageHeader';
import { useUserStore } from '@/store/useUserStore';
import { DiceGame } from '../components/DiceGame';
import { LobbyInterface } from '@/features/games/components/LobbyInterface';
import './style.css';
import { createBet, processGameResult } from '@/services/transactions';
import { GameType } from '@/types/game';

type GameMode = 'bot' | 'player';
type GameState = 'setup' | 'lobby' | 'playing';
type BetType = 'tokens' | 'real';

export function DicePage() {
  const { t } = useTranslation();
  const [betType, setBetType] = useState<BetType>('tokens');
  const [gameMode, setGameMode] = useState<GameMode>('bot');
  const [gameState, setGameState] = useState<GameState>('setup');
  const [betAmount, setBetAmount] = useState<number>(100);

  const updateUserBalance = useUserStore(state => state.updateBalance);

  const handleStartGame = async () => {
    try {
      const userBalance = useUserStore.getState().balance;
      
      if (betType === 'tokens' && userBalance < betAmount) {
        window.Telegram?.WebApp?.showPopup({
          title: t('common.error'),
          message: t('pages.games.dice.errors.insufficientBalance'),
          buttons: [{ type: 'ok' }]
        });
        return;
      }

      if (gameMode === 'bot') {
        await createBet(betAmount, GameType.DICE);
        updateUserBalance(-betAmount);
        setGameState('playing');
      } else {
        setGameState('lobby');
      }
    } catch (error: unknown) {
      console.error('Error starting game:', error);
      window.Telegram?.WebApp?.showPopup({
        title: t('common.error'),
        message: error instanceof Error ? error.message : t('pages.games.dice.errors.betFailed'),
        buttons: [{ type: 'ok' }]
      });
    }
  };

  const handleGameEnd = async (result: 'win' | 'lose' | 'draw') => {
    if (result !== 'draw') {
      try {
        await processGameResult(GameType.DICE, result, betAmount);
        if (result === 'win') {
          updateUserBalance(betAmount * 2);
        }
      } catch (error: unknown) {
        console.error('Error processing game result:', error);
        window.Telegram?.WebApp?.showPopup({
          title: t('common.error'),
          message: error instanceof Error ? error.message : t('pages.games.dice.errors.resultFailed'),
          buttons: [{ type: 'ok' }]
        });
      }
    }
    setGameState('setup');
  };

  const handleCreateGame = async () => {
    try {
      await createBet(betAmount, GameType.DICE);
      updateUserBalance(-betAmount);
      setGameState('playing');
    } catch (error) {
      console.error('Error creating multiplayer game:', error);
    }
  };

  const handleJoinGame = async (gameId: string) => {
    const tg = window.Telegram?.WebApp;
    
    try {
      if (!tg?.initData) return;

      const response = await fetch(`https://test.timecommunity.xyz/api/games/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gameId: `game_${gameId}`,
          initData: tg.initData
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to join game');
      }

      const data = await response.json();
      if (data.success) {
        setGameState('playing');
      }
    } catch (error) {
      console.error('Error joining game:', error);
      tg?.showPopup({
        title: t('common.error'),
        message: error instanceof Error ? error.message : t('game.joinError'),
        buttons: [{ type: 'ok' }]
      });
    }
  };

  return (
    <SafeArea>
      <PageContainer>
        <PageHeader title={t('pages.games.dice.title')} />
        
        {gameState === 'setup' && (
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

            <button className="start-game-button" onClick={handleStartGame}>
              {t('pages.games.dice.startGame')}
            </button>
          </div>
        )}

        {gameState === 'lobby' && (
          <div className="dice-lobby">
            <LobbyInterface
              gameType="dice"
              onCreate={handleCreateGame}
              onJoin={handleJoinGame}
              className="styled-lobby"
            />
          </div>
        )}

        {gameState === 'playing' && (
          <DiceGame
            betAmount={betAmount}
            onGameEnd={handleGameEnd}
          />
        )}
      </PageContainer>
    </SafeArea>
  );
} 