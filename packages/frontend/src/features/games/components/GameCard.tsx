import React from 'react';
import { Icon } from '@iconify/react';
import './GameCard.css';

interface Game {
  _id?: string;
  name: string;
  betAmount: number;
  players: any[];
}

interface GameCardProps {
  game: Game;
  onJoin: () => void;
}

export function GameCard({ game, onJoin }: GameCardProps) {
  return (
    <div className="game-card">
      <div className="game-info">
        <div className="game-name">{game.name}</div>
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
          <button className="join-button" onClick={onJoin}>
            <Icon icon="mdi:login" />
          </button>
        </div>
      </div>
    </div>
  );
} 