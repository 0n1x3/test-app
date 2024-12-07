// Общие типы для всего приложения
export interface User {
  id: string;
  address: string;
  balance: string;
}

export interface Game {
  id: string;
  name: string;
  players: User[];
  status: 'waiting' | 'playing' | 'finished';
  createdAt: number;
}

export interface GameState {
  gameId: string;
  // Добавьте необходимые поля для состояния игры
  currentPlayer?: string;
  moves?: any[];
  // ... другие поля состояния
}

// События WebSocket
export enum WSEvents {
  GAME_STATE_UPDATE = 'gameStateUpdate',
  PLAYER_JOINED = 'playerJoined',
  PLAYER_LEFT = 'playerLeft'
} 