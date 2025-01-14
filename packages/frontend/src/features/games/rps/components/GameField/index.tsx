'use client';

import { useState } from 'react';
import { Icon } from '@iconify/react';
import { useTranslation } from '@/providers/i18n';
import './style.css';

type Choice = 'rock' | 'paper' | 'scissors';
type GameResult = 'win' | 'lose' | 'draw';

interface GameFieldProps {
  betAmount: number;
  onGameEnd: (result: GameResult) => void;
}

const choiceIcons: Record<Choice, string> = {
  rock: 'game-icons:stone-block',
  paper: 'game-icons:folded-paper',
  scissors: 'mdi:scissors',
};

export function GameField({ betAmount, onGameEnd }: GameFieldProps) {
  const { t } = useTranslation();
  const [round, setRound] = useState(1);
  const [playerChoice, setPlayerChoice] = useState<Choice | null>(null);
  const [botChoice, setBotChoice] = useState<Choice | null>(null);
  const [roundResult, setRoundResult] = useState<GameResult | null>(null);
  const [playerScore, setPlayerScore] = useState(0);
  const [botScore, setBotScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const choices: Choice[] = ['rock', 'paper', 'scissors'];

  const determineWinner = (player: Choice, bot: Choice): GameResult => {
    if (player === bot) return 'draw';
    if (
      (player === 'rock' && bot === 'scissors') ||
      (player === 'paper' && bot === 'rock') ||
      (player === 'scissors' && bot === 'paper')
    ) {
      return 'win';
    }
    return 'lose';
  };

  const handleChoice = (choice: Choice) => {
    if (playerChoice || showResult || isAnimating) return;
    
    setIsAnimating(true);
    setPlayerChoice(choice);
    
    // Анимация "качания" перед выбором бота
    setTimeout(() => {
      const randomChoice = choices[Math.floor(Math.random() * choices.length)];
      setBotChoice(randomChoice);
      
      const result = determineWinner(choice, randomChoice);
      setRoundResult(result);
      setShowResult(true);
      
      if (result === 'win') setPlayerScore(prev => prev + 1);
      if (result === 'lose') setBotScore(prev => prev + 1);
      
      setTimeout(() => {
        setIsAnimating(false);
        
        if (round < 3) {
          setRound(prev => prev + 1);
          setPlayerChoice(null);
          setBotChoice(null);
          setRoundResult(null);
          setShowResult(false);
        } else {
          const finalResult = playerScore > botScore ? 'win' : 
                            playerScore < botScore ? 'lose' : 'draw';
          onGameEnd(finalResult);
        }
      }, 2000);
    }, 1000);
  };

  return (
    <div className="game-field">
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
          <div className="player-choice">
            {(botChoice || isAnimating) && (
              <Icon 
                icon={botChoice ? choiceIcons[botChoice] : 'mdi:hand-back'} 
                className={`choice-icon ${showResult ? 'show' : ''} ${isAnimating ? 'shaking' : ''}`}
              />
            )}
          </div>
        </div>

        {showResult && (
          <div className={`round-result ${roundResult}`}>
            {t(`pages.games.rps.results.${roundResult}`)}
          </div>
        )}

        <div className="player human">
          <div className="player-choice">
            {(playerChoice || isAnimating) && (
              <Icon 
                icon={playerChoice ? choiceIcons[playerChoice] : 'mdi:hand-back'} 
                className={`choice-icon ${showResult ? 'show' : ''} ${isAnimating ? 'shaking' : ''}`}
              />
            )}
          </div>
          <div className="choice-buttons">
            {choices.map(choice => (
              <button
                key={choice}
                className="choice-button"
                onClick={() => handleChoice(choice)}
                disabled={!!(isAnimating || playerChoice || showResult)}
              >
                <Icon icon={choiceIcons[choice]} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 