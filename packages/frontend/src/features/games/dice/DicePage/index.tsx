'use client';

import { useState, useEffect } from 'react';
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
import { toast } from 'react-hot-toast';
import { MultiplayerDiceGame } from '../components/MultiplayerDiceGame';

type GameMode = 'bot' | 'player';
type GameState = 'setup' | 'lobby' | 'playing';
type BetType = 'tokens' | 'real';

export function DicePage() {
  const { t } = useTranslation();
  const [betType, setBetType] = useState<BetType>('tokens');
  const [gameMode, setGameMode] = useState<GameMode>('bot');
  const [gameState, setGameState] = useState<GameState>('setup');
  const [betAmount, setBetAmount] = useState<number>(100);
  const [activeGameId, setActiveGameId] = useState<string | null>(null);

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
    try {
      const tg = window.Telegram?.WebApp;
      
      if (!tg?.initData) {
        console.error('Telegram WebApp initData недоступен');
        toast.error('Не удалось получить данные Telegram');
        return;
      }
      
      console.log(`Отправка запроса на присоединение к игре: ${gameId}`);
      
      const response = await fetch('https://test.timecommunity.xyz/api/games/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gameId: gameId.startsWith('game_') ? gameId.replace('game_', '') : gameId,
          initData: tg.initData
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Ошибка при присоединении к игре';
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || `Ошибка ${response.status}: ${response.statusText}`;
        } catch (parseError) {
          console.error('Не удалось разобрать ответ с ошибкой:', parseError);
        }
        
        tg?.showPopup({
          title: t('common.error'),
          message: errorMessage,
          buttons: [{ type: 'ok' }]
        });
        
        return;
      }

      const data = await response.json();
      console.log('Успешное присоединение к игре:', data);
      
      if (data.success) {
        setTimeout(() => {
          setActiveGameId(gameId);
          setGameMode('player');
          setGameState('playing');
        }, 0);
      }
    } catch (error) {
      console.error('Ошибка при обработке присоединения к игре:', error);
      
      const tg = window.Telegram?.WebApp;
      tg?.showPopup({
        title: t('common.error'),
        message: error instanceof Error ? error.message : t('game.joinError'),
        buttons: [{ type: 'ok' }]
      });
    }
  };

  // Добавляем useEffect для проверки сохраненного gameId
  useEffect(() => {
    const checkPendingGame = async () => {
      const pendingGameId = localStorage.getItem('pendingGameJoin');
      
      if (pendingGameId) {
        console.log('Found pending game join:', pendingGameId);
        localStorage.removeItem('pendingGameJoin'); // Удаляем сохраненный ID
        
        // Устанавливаем режим игры с игроком
        setGameMode('player');
        setGameState('lobby');
        
        // С небольшой задержкой присоединяемся к игре
        setTimeout(() => {
          handleJoinGame(pendingGameId);
        }, 1000);
      }
    };
    
    checkPendingGame();
  }, []);

  // Добавьте в useEffect для просмотра рендеров
  useEffect(() => {
    console.log('DicePage rendered');
  }, []);

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
          <>
            {gameMode === 'bot' ? (
              <DiceGame
                betAmount={betAmount}
                onGameEnd={handleGameEnd}
              />
            ) : (
              <MultiplayerDiceGame
                gameId={activeGameId || ''}
                betAmount={betAmount}
                onGameEnd={handleGameEnd}
              />
            )}
          </>
        )}
      </PageContainer>
    </SafeArea>
  );
} 