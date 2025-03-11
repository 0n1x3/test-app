import React from 'react';
import { Icon } from '@iconify/react';
import './GameCard.css';

interface Game {
  _id?: string;
  name: string;
  betAmount: number;
  players: any[];
  createdBy?: string;
}

interface GameCardProps {
  game: Game;
  onJoin: () => void;
  onDelete?: () => void;
  isCreator?: boolean;
}

const formatGameName = (name: string, id: string | undefined) => {
  if (!id) return name;
  const shortId = id.slice(-4);
  return `${name} #${shortId}`;
};

export function GameCard({ game, onJoin, onDelete, isCreator }: GameCardProps) {
  const handleCopy = () => {
    console.log('Copy link');
  };

  return (
    <div className="game-card">
      <div className="game-info">
        <div className="game-name" title={formatGameName(game.name, game._id)}>
          {formatGameName(game.name, game._id)}
        </div>
        <div className="game-bet">
          <Icon icon="mdi:diamond" />
          {game.betAmount}
        </div>
      </div>
      <div className="game-footer">
        <div className="player-count">
          <Icon icon="mdi:account" />
          {game.players.length}/2
          <span className="status-text">Ожидание игроков</span>
        </div>
        <div className="game-actions">
          {isCreator && onDelete && (
            <button 
              className="copy-button" 
              onClick={onDelete} 
              title="Удалить игру"
            >
              <Icon icon="mdi:delete" />
            </button>
          )}
          <button 
            className="copy-button" 
            onClick={handleCopy}
            title="Копировать ссылку"
          >
            <Icon icon="mdi:content-copy" />
          </button>
          <button 
            className="join-button" 
            onClick={onJoin}
            title="Присоединиться к игре"
          >
            <Icon icon="mdi:play" />
          </button>
        </div>
      </div>
    </div>
  );
} 