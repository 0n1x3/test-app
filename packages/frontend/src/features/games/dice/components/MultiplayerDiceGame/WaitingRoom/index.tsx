'use client';

import React from 'react';
import { Icon } from '@iconify/react';
import { ConnectionStatusIndicator } from './ConnectionStatusIndicator';
import { BetInfo } from './BetInfo';
import './style.css';

// Типы
type ConnectionStatus = 'connecting' | 'connected' | 'error';

interface Player {
  telegramId: string;
  username?: string;
  avatarUrl?: string;
}

interface WaitingRoomProps {
  gameId: string;
  betAmount: number;
  players: Player[];
  connectionStatus: ConnectionStatus;
  socketError: string | null;
  onCopyInviteLink: () => void;
  onReconnect: () => void;
}

export function WaitingRoom({
  gameId,
  betAmount,
  players,
  connectionStatus,
  socketError,
  onCopyInviteLink,
  onReconnect
}: WaitingRoomProps) {
  return (
    <div className="dice-game">
      {/* Индикатор статуса подключения */}
      <ConnectionStatusIndicator status={connectionStatus} />
      
      {/* Информация об игре */}
      <div className="game-header">
        <h2>Игра в кости</h2>
        <BetInfo amount={betAmount} />
      </div>
      
      {connectionStatus !== 'connected' ? (
        <div className="connecting-container">
          <div className="loading-spinner"></div>
          <p>Подключение к игре...</p>
          {socketError && (
            <div className="error-container">
              <p>{socketError}</p>
              <button className="reload-button" onClick={onReconnect}>
                Повторить подключение
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="waiting-container">
          <h2>Ожидание соперника</h2>
          <p>Поделитесь ссылкой с другом или дождитесь пока кто-то присоединится</p>
          
          <div className="copy-link-button">
            <button onClick={onCopyInviteLink}>
              <Icon icon="mdi:content-copy" />
              <span>Скопировать ссылку</span>
            </button>
          </div>
          
          <div className="player-count">
            <p>Подключенные игроки ({players.length}/2):</p>
            {players.length === 0 ? (
              <p className="no-players">Ожидание подключения игроков...</p>
            ) : (
              <div className="players-list">
                {players.map((player, index) => (
                  <div key={index} className="player-item">
                    <div className="player-avatar">
                      {player.avatarUrl ? (
                        <img src={player.avatarUrl} alt={player.username || 'Игрок'} />
                      ) : (
                        <span className="avatar-placeholder">👤</span>
                      )}
                    </div>
                    <span className="player-name">{player.username || `Игрок ${index + 1}`}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 