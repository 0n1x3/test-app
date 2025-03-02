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
  console.log('GameCard props:', { 
    gameId: game._id, 
    gameName: game.name, 
    isCreator, 
    hasDeleteHandler: !!onDelete 
  });
  
  return (
    <div className="game-card">
      <div className="game-info">
        <div className="game-name">{formatGameName(game.name, game._id)}</div>
        <div className="game-bet">
          <Icon icon="material-symbols:diamond-rounded" />
          <span>{game.betAmount}</span>
        </div>
      </div>
      
      <div className="game-footer">
        <div className="player-count">
          <Icon icon="mdi:account" />
          <span>{game.players.length}/2</span>
          <span className="status-text">Ожидание игроков</span>
        </div>
        
        <div className="game-actions">
          {isCreator && onDelete && (
            <button className="copy-button" onClick={onDelete} title="Удалить игру">
              <Icon icon="mdi:delete" />
            </button>
          )}
          <button className="join-button" onClick={onJoin}>
            <Icon icon="mdi:login" />
          </button>
        </div>
      </div>
    </div>
  );
} 