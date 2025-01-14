'use client';

import { useState } from 'react';
import { Icon } from '@iconify/react';
import { useTranslation } from '@/providers/i18n';
import { Dice } from '../Dice';
import './style.css';

type GameResult = 'win' | 'lose' | 'draw';

interface DiceGameProps {
  betAmount: number;
  onGameEnd: (result: GameResult) => void;
}

export function DiceGame({ betAmount, onGameEnd }: DiceGameProps) {
  const { t } = useTranslation();
  const [round, setRound] = useState(1);
  const [playerScore, setPlayerScore] = useState(0);
  const [botScore, setBotScore] = useState(0);
  const [playerValue, setPlayerValue] = useState<number | null>(null);
  const [botValue, setBotValue] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [roundResult, setRoundResult] = useState<GameResult | null>(null);

  const handleRoll = () => {
    if (isRolling) return;
    
    setIsRolling(true);
    setShowResult(false);
    
    // Анимация броска
    setTimeout(() => {
      const playerRoll = Math.floor(Math.random() * 6) + 1;
      const botRoll = Math.floor(Math.random() * 6) + 1;
      
      setPlayerValue(playerRoll);
      setBotValue(botRoll);
      
      // Определяем победителя раунда
      const result = playerRoll > botRoll ? 'win' : 
                    playerRoll < botRoll ? 'lose' : 'draw';
      
      // Начисляем очки только при явной победе/поражении
      if (result === 'win') setPlayerScore(prev => prev + 1);
      if (result === 'lose') setBotScore(prev => prev + 1);
      
      setRoundResult(result);
      setShowResult(true);
      setIsRolling(false);
      
      // Проверяем, достиг ли кто-то 2 побед
      setTimeout(() => {
        if (playerScore === 1 && result === 'win' || 
            botScore === 1 && result === 'lose') {
          // Кто-то достиг 2 побед
          onGameEnd(result);
        } else {
          // Продолжаем игру
          setRound(prev => prev + 1);
          setPlayerValue(null);
          setBotValue(null);
          setShowResult(false);
          setRoundResult(null);
        }
      }, 2000);
    }, 2000);
  };

  return (
    <div className="dice-game">
      <div className="game-header">
        <div className="score">
          <div className="player-score">{playerScore}</div>
          <div className="round">
            <div className="round-number">Round {round}/3</div>
            <div className="bet-amount">
              <Icon icon="material-symbols:diamond-rounded" />
              {betAmount}
            </div>
          </div>
          <div className="bot-score">{botScore}</div>
        </div>
      </div>

      <div className="game-area">
        <div className="player bot">
          <div className="player-avatar">
            <Icon icon="mdi:robot" className="avatar-icon" />
          </div>
          <Dice value={botValue} isRolling={isRolling} />
        </div>

        {showResult && (
          <div className={`round-result ${roundResult}`}>
            {t(`pages.games.dice.results.${roundResult}`)}
          </div>
        )}

        <div className="player human">
          <Dice value={playerValue} isRolling={isRolling} />
          <button 
            className="roll-button"
            onClick={handleRoll}
            disabled={isRolling || showResult}
          >
            {t('pages.games.dice.roll')}
          </button>
        </div>
      </div>
    </div>
  );
} 