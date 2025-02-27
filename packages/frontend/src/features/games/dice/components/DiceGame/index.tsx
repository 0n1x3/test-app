'use client';

import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { useTranslation } from '@/providers/i18n';
import { Dice } from '../Dice';
import { LobbyInterface } from '@/features/games/components/LobbyInterface';
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
  const [playerDice, setPlayerDice] = useState<number>(1);
  const [botDice, setBotDice] = useState<number>(1);
  const [isRolling, setIsRolling] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [roundResult, setRoundResult] = useState<GameResult | null>(null);

  const rollDice = () => {
    setIsRolling(true);
    
    // Генерируем одиночные значения для кубиков игрока и бота
    const newPlayerDice = Math.floor(Math.random() * 6) + 1;
    const newBotDice = Math.floor(Math.random() * 6) + 1;
    
    // Устанавливаем новые значения после анимации
    setTimeout(() => {
      setPlayerDice(newPlayerDice);
      setBotDice(newBotDice);
      setIsRolling(false);
      
      // Определяем результат на основе сравнения значений кубиков
      let result: GameResult;
      if (newPlayerDice > newBotDice) {
        result = 'win';
      } else if (newPlayerDice < newBotDice) {
        result = 'lose';
      } else {
        result = 'draw';
      }
      
      console.log('Round result:', result);
      
      // Обновляем счет и проверяем окончание игры
      if (result === 'win') {
        setPlayerScore(prevScore => {
          const newScore = prevScore + 1;
          if (newScore >= 2) {
            // Задержка для показа результата
            setTimeout(() => onGameEnd(result), 2000);
          }
          return newScore;
        });
      } else if (result === 'lose') {
        setBotScore(prevScore => {
          const newScore = prevScore + 1;
          if (newScore >= 2) {
            // Задержка для показа результата
            setTimeout(() => onGameEnd(result), 2000);
          }
          return newScore;
        });
      }

      setRoundResult(result);
      setShowResult(true);

      // Переход к следующему раунду если игра не закончена
      if (result !== 'draw') {
        setTimeout(() => {
          const currentPlayerScore = playerScore;
          const currentBotScore = botScore;
          
          if (currentPlayerScore < 2 && currentBotScore < 2) {
            setRound(prev => prev + 1);
            setPlayerDice(1);
            setBotDice(1);
            setShowResult(false);
            setRoundResult(null);
          }
        }, 2000);
      } else {
        // При ничьей сразу переходим к следующему раунду
        setTimeout(() => {
          setRound(prev => prev + 1);
          setPlayerDice(1);
          setBotDice(1);
          setShowResult(false);
          setRoundResult(null);
        }, 2000);
      }
    }, 1000);
  };

  useEffect(() => {
    if (roundResult !== null) {
      // Показываем результат и вызываем onGameEnd через 2 секунды
      const timer = setTimeout(() => {
        onGameEnd(roundResult);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [roundResult, onGameEnd]);

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

      <div className="dice-container">
        <div className="player-dice">
          <h3>Ваш кубик</h3>
          <div className="dice-row">
            <Dice 
              value={playerDice} 
              rolling={isRolling}
              size="large"
            />
          </div>
        </div>
        
        <div className="vs-indicator">VS</div>
        
        <div className="bot-dice">
          <h3>Кубик бота</h3>
          <div className="dice-row">
            <Dice 
              value={botDice} 
              rolling={isRolling}
              size="large"
            />
          </div>
        </div>
      </div>
      
      {showResult ? (
        <div className={`game-result ${roundResult}`}>
          {t(`pages.games.dice.results.${roundResult}`)}
        </div>
      ) : (
        <button 
          className="roll-button" 
          onClick={(e) => {
            e.stopPropagation();
            rollDice();
          }} 
          disabled={isRolling || showResult}
          style={{ position: 'relative', zIndex: 100 }}
        >
          {t('pages.games.dice.roll')}
        </button>
      )}
    </div>
  );
} 