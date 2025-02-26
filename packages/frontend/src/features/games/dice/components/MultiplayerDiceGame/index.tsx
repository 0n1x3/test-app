'use client';

import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Icon } from '@iconify/react';
import { useTranslation } from '@/providers/i18n';
import { useUserStore } from '@/store/useUserStore';
import { Dice } from '../Dice';
import './style.css';

type GameResult = 'win' | 'lose' | 'draw';

// Добавляем типы для данных, получаемых от сервера
interface GameStateData {
  players: Array<{
    telegramId: number;
    username?: string;
    avatarUrl?: string;
  }>;
  status: 'waiting' | 'playing' | 'finished';
  currentRound?: number;
  currentPlayer?: string;
  rounds?: Array<{
    player1: number;
    player2: number;
    result: 'win' | 'lose' | 'draw';
  }>;
}

interface DiceMoveData {
  gameId: string;
  userId: string;
  value: number;
  nextMove: string;
}

interface RoundResultData {
  round: number;
  players: number[];
  result: GameResult;
  player1Value: number;
  player2Value: number;
}

interface GameEndData {
  gameId: string;
  winner: number;
  score: [number, number];
}

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
  const [opponent, setOpponent] = useState({ id: '', name: 'Противник', avatar: '/avatars/nft5.png' });
  const [isYourTurn, setIsYourTurn] = useState(false);
  const [gameStatus, setGameStatus] = useState<'waiting' | 'ready' | 'playing' | 'finished'>('waiting');
  
  // Сохраняем ссылку на сокет
  const socketRef = useRef<Socket | null>(null);
  const currentUser = useUserStore(state => ({ 
    id: state.telegramId || 0, // Устанавливаем значение по умолчанию
    name: state.username || 'Вы',
    avatar: state.avatarUrl || '/avatars/nft1.png'
  }));

  // Добавляем флаг для отслеживания монтирования компонента
  useEffect(() => {
    console.log('Connecting to game:', gameId);
    
    // Создаем флаг для отслеживания размонтирования
    let isMounted = true;
    
    const socket = io('https://test.timecommunity.xyz', {
      path: '/socket.io',
      auth: {
        gameId,
        telegramId: currentUser.id
      }
    });
    
    socketRef.current = socket;
    
    // Регистрируем обработчики событий
    socket.on('connect', () => {
      console.log('Socket connected');
      
      // Присоединяемся к комнате игры
      socket.emit('joinGameRoom', { gameId });
    });
    
    socket.on('gameState', (data: GameStateData) => {
      // Проверяем, монтирован ли еще компонент
      if (!isMounted) return;
      
      console.log('Received game state:', data);
      
      // Обновляем состояние игры на основе полученных данных
      if (data.players && data.players.length > 1) {
        // Находим оппонента (не текущего пользователя)
        const opponentData = data.players.find(p => p.telegramId !== currentUser.id);
        if (opponentData) {
          setOpponent({
            id: String(opponentData.telegramId),
            name: opponentData.username || 'Игрок #' + String(opponentData.telegramId).slice(-4),
            avatar: opponentData.avatarUrl || '/avatars/nft2.png'
          });
        }
        
        setGameStatus('ready');
      } else {
        setGameStatus('waiting');
      }
      
      // Если игра уже идет, обновляем состояние раунда и счет
      if (data.status === 'playing') {
        setGameStatus('playing');
        setRound(data.currentRound || 1);
        
        // Определяем, чей сейчас ход
        if (data.currentPlayer) {
          setIsYourTurn(data.currentPlayer === String(currentUser.id));
        }
        
        // Обновляем счет игры, если есть раунды
        if (data.rounds && data.rounds.length > 0) {
          let player1Wins = 0;
          let player2Wins = 0;
          
          data.rounds.forEach((round) => {
            if (round.result === 'win') player1Wins++;
            else if (round.result === 'lose') player2Wins++;
          });
          
          // Определяем, какой счет показать текущему игроку
          const isPlayer1 = data.players[0]?.telegramId === currentUser.id;
          
          if (isPlayer1) {
            setPlayerScore(player1Wins);
            setOpponentScore(player2Wins);
          } else {
            setPlayerScore(player2Wins);
            setOpponentScore(player1Wins);
          }
        }
      }
    });
    
    socket.on('diceMove', (data: DiceMoveData) => {
      console.log('Received dice move:', data);
      
      // Обрабатываем ход противника
      if (data.userId !== String(currentUser.id)) {
        setOpponentValue(data.value);
        setIsRolling(false);
        
        // Переключаем ход на текущего игрока, если это необходимо
        if (data.nextMove === String(currentUser.id)) {
          setIsYourTurn(true);
          setIsWaiting(false);
        }
      }
    });
    
    socket.on('roundResult', (data: RoundResultData) => {
      console.log('Received round result:', data);
      
      // Определяем результат для текущего игрока
      const isPlayer1 = data.players[0] === currentUser.id;
      
      // Показываем результат
      setRoundResult(isPlayer1 ? data.result : 
        data.result === 'win' ? 'lose' : 
        data.result === 'lose' ? 'win' : 'draw');
      
      setShowResult(true);
      
      // Скрываем результат через 2 секунды
      setTimeout(() => {
        setShowResult(false);
        setRoundResult(null);
        
        // Сбрасываем значения кубиков
        setPlayerValue(null);
        setOpponentValue(null);
      }, 2000);
    });
    
    socket.on('gameEnd', (data: GameEndData) => {
      console.log('Game ended:', data);
      
      // Определяем общий результат игры
      const isWinner = data.winner === currentUser.id;
      
      setTimeout(() => {
        onGameEnd(isWinner ? 'win' : 'lose');
      }, 2000);
    });
    
    socket.on('diceGameStarted', (data: { gameId: string, firstPlayer: string, status: string }) => {
      console.log('Dice game started:', data);
      
      setGameStatus('playing');
      setIsYourTurn(data.firstPlayer === String(currentUser.id));
    });
    
    socket.on('error', (error: Error) => {
      console.error('Socket error:', error);
    });
    
    // Обработчик ошибок подключения
    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      // Показываем сообщение об ошибке пользователю
      window.Telegram?.WebApp?.showPopup({
        title: 'Ошибка подключения',
        message: 'Не удалось подключиться к игре. Попробуйте еще раз.',
        buttons: [{ type: 'ok' }]
      });
    });
    
    // Очистка при размонтировании компонента
    return () => {
      console.log('Disconnecting socket');
      isMounted = false; // Устанавливаем флаг в false при размонтировании
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [currentUser.id, gameId, onGameEnd]);

  // Функция для броска кубика
  const handleRoll = () => {
    if (isRolling || !isYourTurn) return;
    
    setIsRolling(true);
    setIsWaiting(true);
    
    const socket = socketRef.current;
    if (!socket) {
      console.error('Socket not connected');
      return;
    }
    
    const value = Math.floor(Math.random() * 6) + 1;
    setPlayerValue(value);
    setIsYourTurn(false);
    
    socket.emit('diceMove', {
      gameId,
      value,
      userId: currentUser.id
    });
    
    // Имитация задержки броска кубика
    setTimeout(() => {
      setIsRolling(false);
    }, 1000);
  };
  
  // Функция для запуска игры
  const handleStartGame = () => {
    const socket = socketRef.current;
    if (!socket) {
      console.error('Socket not connected');
      return;
    }
    
    socket.emit('startDiceGame', { gameId });
  };
  
  // Функция для копирования ссылки-приглашения
  const copyInviteLink = () => {
    try {
      const link = `https://t.me/neometria_bot?startapp=game_${gameId}`;
      
      // Пытаемся скопировать ссылку
      navigator.clipboard.writeText(link)
        .then(() => {
          window.Telegram?.WebApp?.showPopup({
            title: 'Успех',
            message: 'Ссылка скопирована в буфер обмена',
            buttons: [{ type: 'ok' }]
          });
        })
        .catch((error) => {
          console.error('Ошибка копирования:', error);
          
          // Альтернативный метод копирования
          const textarea = document.createElement('textarea');
          textarea.value = link;
          document.body.appendChild(textarea);
          textarea.select();
          
          try {
            document.execCommand('copy');
            window.Telegram?.WebApp?.showPopup({
              title: 'Успех',
              message: 'Ссылка скопирована в буфер обмена',
              buttons: [{ type: 'ok' }]
            });
          } catch (err) {
            window.Telegram?.WebApp?.showPopup({
              title: 'Ошибка',
              message: 'Не удалось скопировать ссылку',
              buttons: [{ type: 'ok' }]
            });
          }
          
          document.body.removeChild(textarea);
        });
    } catch (error) {
      console.error('Ошибка при копировании ссылки:', error);
    }
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
        {gameStatus === 'waiting' ? (
          <div className="waiting-message">
            <h3>Ожидание соперника</h3>
            <p>Пригласите друга, чтобы начать игру</p>
            <div className="share-link">
              <button 
                className="copy-invite-button"
                onClick={copyInviteLink}
              >
                <Icon icon="material-symbols:content-copy" />
                Скопировать ссылку-приглашение
              </button>
            </div>
          </div>
        ) : (
          <>
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
              
              {gameStatus === 'ready' ? (
                <button 
                  className="roll-button start-game-button"
                  onClick={handleStartGame}
                >
                  Начать игру
                </button>
              ) : (
                <button 
                  className="roll-button"
                  onClick={handleRoll}
                  disabled={isRolling || isWaiting || !isYourTurn || gameStatus !== 'playing'}
                >
                  {isWaiting 
                    ? t('pages.games.dice.waiting') 
                    : isYourTurn 
                      ? t('pages.games.dice.roll')
                      : 'Ход соперника'}
                </button>
              )}
              
              {gameStatus === 'playing' && (
                <div className={`turn-indicator ${isYourTurn ? 'your-turn' : 'opponent-turn'}`}>
                  {isYourTurn ? 'Ваш ход' : 'Ход соперника'}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {gameStatus === 'waiting' && (
        <button 
          className="copy-invite-button"
          onClick={copyInviteLink}
        >
          <Icon icon="material-symbols:content-copy" />
          Скопировать ссылку-приглашение
        </button>
      )}
    </div>
  );
} 