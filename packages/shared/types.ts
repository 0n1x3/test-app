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
  state: any; // Конкретное состояние игры
  lastUpdate: number;
}

// События WebSocket
export enum WSEvents {
  JOIN_GAME = 'joinGame',
  LEAVE_GAME = 'leaveGame',
  GAME_ACTION = 'gameAction',
  GAME_STATE_UPDATE = 'gameStateUpdate',
  PLAYER_JOINED = 'playerJoined',
  PLAYER_LEFT = 'playerLeft'
} 