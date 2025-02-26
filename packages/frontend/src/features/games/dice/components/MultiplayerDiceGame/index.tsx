'use client';

import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { useTranslation } from '@/providers/i18n';
import { Dice } from '../Dice';
import './style.css';

type GameResult = 'win' | 'lose' | 'draw';

interface MultiplayerDiceGameProps {
  gameId: string;
  betAmount: number;
  onGameEnd: (result: GameResult) => void;
}

export function MultiplayerDiceGame({ gameId, betAmount, onGameEnd }: MultiplayerDiceGameProps) {
  const { t } = useTranslation();
  const [round, setRound] = useState(1);
  const [playerScore, setPlayerScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [playerValue, setPlayerValue] = useState<number | null>(null);
  const [opponentValue, setOpponentValue] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [roundResult, setRoundResult] = useState<GameResult | null>(null);
  const [opponent, setOpponent] = useState({ name: 'Противник', avatar: '/avatars/nft5.png' });

  // Эмуляция соединения через WebSocket для демонстрации
  useEffect(() => {
    console.log('Connecting to game:', gameId);
    
    // Здесь будет реальное подключение к WebSocket
    const connectWebSocket = () => {
      // Временная эмуляция
      setTimeout(() => {
        setOpponent({ 
          name: 'Игрок #' + Math.floor(Math.random() * 1000), 
          avatar: '/avatars/nft' + (Math.floor(Math.random() * 10) + 1) + '.png' 
        });
      }, 1000);
    };
    
    connectWebSocket();
    
    return () => {
      // Отключение от WebSocket
      console.log('Disconnecting from game:', gameId);
    };
  }, [gameId]);

  const handleRoll = () => {
    if (isRolling || isWaiting) return;
    
    setIsRolling(true);
    setShowResult(false);
    
    setTimeout(() => {
      const playerRoll = Math.floor(Math.random() * 6) + 1;
      setPlayerValue(playerRoll);
      
      // Эмуляция ожидания хода противника
      setIsWaiting(true);
      
      // В реальности здесь будет отправка события через WebSocket
      setTimeout(() => {
        const opponentRoll = Math.floor(Math.random() * 6) + 1;
        setOpponentValue(opponentRoll);
        
        // Определяем результат
        let result: GameResult;
        if (playerRoll === opponentRoll) {
          result = 'draw';
        } else if (playerRoll > opponentRoll) {
          result = 'win';
        } else {
          result = 'lose';
        }
        
        // Обновляем счет
        if (result === 'win') {
          setPlayerScore(prev => {
            const newScore = prev + 1;
            if (newScore >= 2) {
              setTimeout(() => onGameEnd(result), 2000);
            }
            return newScore;
          });
        } else if (result === 'lose') {
          setOpponentScore(prev => {
            const newScore = prev + 1;
            if (newScore >= 2) {
              setTimeout(() => onGameEnd(result), 2000);
            }
            return newScore;
          });
        }
        
        setRoundResult(result);
        setShowResult(true);
        setIsRolling(false);
        setIsWaiting(false);
        
        // Переход к следующему раунду если игра не закончена
        setTimeout(() => {
          if ((playerScore < 2 && opponentScore < 2) || result === 'draw') {
            setRound(prev => prev + 1);
            setPlayerValue(null);
            setOpponentValue(null);
            setShowResult(false);
            setRoundResult(null);
          }
        }, 2000);
      }, 1500);
    }, 1000);
  };

  return (
    <div className="multiplayer-dice-game">
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
          <div className="opponent-score">{opponentScore}</div>
        </div>
      </div>

      <div className="game-area">
        <div className="player opponent">
          <div className="player-avatar">
            <img src={opponent.avatar} alt={opponent.name} />
          </div>
          <div className="player-name">{opponent.name}</div>
          <Dice value={opponentValue} isRolling={isRolling && isWaiting} />
        </div>

        {showResult && (
          <div className={`round-result ${roundResult}`}>
            {t(`pages.games.dice.results.${roundResult}`)}
          </div>
        )}

        <div className="player human">
          <Dice value={playerValue} isRolling={isRolling && !isWaiting} />
          <button 
            className="roll-button"
            onClick={handleRoll}
            disabled={isRolling || isWaiting || showResult}
          >
            {isWaiting ? t('pages.games.dice.waiting') : t('pages.games.dice.roll')}
          </button>
        </div>
      </div>
    </div>
  );
} 