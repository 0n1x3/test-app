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
  return (
    <div className="game-card" role="article" aria-label={`Игра ${formatGameName(game.name, game._id)}`} style={{ marginBottom: 0, paddingBottom: "8px" }}>
      <div className="game-info" style={{ marginBottom: 0, paddingBottom: "10px" }}>
        <div style={{ display: 'flex', alignItems: 'center', width: '100%', marginBottom: '4px' }}>
          <div className="game-bet" title={`Ставка: ${game.betAmount}`}>
            <Icon icon="material-symbols:diamond-rounded" aria-hidden="true" />
            {game.betAmount}
          </div>
          <div className="game-name" title={formatGameName(game.name, game._id)}>
            {formatGameName(game.name, game._id)}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between', marginTop: '4px', paddingBottom: "4px" }}>
          <div className="player-count">
            <Icon icon="mdi:account" aria-hidden="true" />
            {game.players.length}/2
            <span className="status-text">Ожидание игроков</span>
          </div>
          <div className="game-actions">
            {isCreator && onDelete && (
              <button 
                className="copy-button" 
                onClick={onDelete} 
                title="Удалить игру"
                aria-label="Удалить игру"
              >
                <Icon icon="mdi:delete" style={{ fontSize: '18px' }} aria-hidden="true" />
              </button>
            )}
            <button 
              className="join-button" 
              onClick={onJoin}
              title="Присоединиться к игре"
              aria-label="Присоединиться к игре"
            >
              <Icon icon="mdi:play" style={{ fontSize: '18px' }} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 