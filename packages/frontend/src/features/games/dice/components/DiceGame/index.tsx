'use client';

import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { useTranslation } from '@/providers/i18n';
import { useUserStore } from '@/store/useUserStore';
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
  const [playerDice, setPlayerDice] = useState<number>(1);
  const [botDice, setBotDice] = useState<number>(1);
  const [isRolling, setIsRolling] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [roundResult, setRoundResult] = useState<GameResult | null>(null);
  
  // Выводим в консоль структуру хранилища для отладки
  console.log('UserStore state:', useUserStore.getState());
  
  // Получаем данные пользователя напрямую из хранилища
  const { avatarUrl, username } = useUserStore();
  
  // Логируем варианты для отладки
  console.log('Possible user data fields:', { avatarUrl, username });
  
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
          const currentPlayerScore = result === 'win' ? playerScore + 1 : playerScore;
          const currentBotScore = result === 'lose' ? botScore + 1 : botScore;
          
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

  return (
    <div className="dice-game">
      <div className="game-header">
        <div className="score">
          <div className="player-side">
            <div className="player-avatar">
              <Icon icon="mdi:account-circle" />
            </div>
            <div className="player-score">{playerScore}</div>
          </div>
          
          <div className="round-info">
            <div className="round-number">Раунд {round}/3</div>
            <div className="bet-amount">
              <Icon icon="material-symbols:diamond-rounded" />
              {betAmount}
            </div>
          </div>
          
          <div className="bot-side">
            <div className="bot-score">{botScore}</div>
            <div className="bot-avatar">
              <Icon icon="mdi:robot" className="bot-icon" />
            </div>
          </div>
        </div>
      </div>

      <div className="game-field">
        <div className="bot-dice-container">
          <div className="dice-wrapper">
            <Dice 
              value={botDice} 
              rolling={isRolling}
              size="large"
            />
          </div>
        </div>
        
        <div className="vs-indicator">VS</div>
        
        <div className="player-dice-container">
          <div className="dice-wrapper">
            <Dice 
              value={playerDice} 
              rolling={isRolling}
              size="large"
            />
          </div>
        </div>
      </div>
      
      <div className="controls-area">
        {showResult ? (
          <div className={`game-result ${roundResult}`}>
            {roundResult === 'win' && 'Вы выиграли!'}
            {roundResult === 'lose' && 'Вы проиграли!'}
            {roundResult === 'draw' && 'Ничья!'}
          </div>
        ) : (
          <button 
            className="roll-button" 
            onClick={(e) => {
              e.stopPropagation();
              rollDice();
            }} 
            disabled={isRolling}
          >
            Бросить кубик
          </button>
        )}
      </div>
    </div>
  );
} 