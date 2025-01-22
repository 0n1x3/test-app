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
    
    setTimeout(() => {
      const playerRoll = Math.floor(Math.random() * 6) + 1;
      const botRoll = Math.floor(Math.random() * 6) + 1;
      
      console.log('Generated rolls:', { player: playerRoll, bot: botRoll });
      
      setPlayerValue(playerRoll);
      setBotValue(botRoll);
      
      // Определяем результат
      let result: GameResult;
      if (playerRoll === botRoll) {
        result = 'draw';
      } else if (playerRoll > botRoll) {
        result = 'win';
      } else {
        result = 'lose';
      }
      
      console.log('Round result:', result);
      setRoundResult(result);
      setShowResult(true);
      setIsRolling(false);

      // Обновляем счет
      if (result === 'win') {
        setPlayerScore(prev => prev + 1);
      } else if (result === 'lose') {
        setBotScore(prev => prev + 1);
      }

      // Проверяем окончание игры
      setTimeout(() => {
        if (playerScore >= 1 && result === 'win' || 
            botScore >= 1 && result === 'lose') {
          onGameEnd(result);
        } else {
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