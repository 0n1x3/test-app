// Общие типы для всего приложения
export enum GameType {
  RPS = 'rps',
  DICE = 'dice'
}

// Тип для API и WebSocket
export interface User {
  id: string;
  telegramId: number;
  username: string;
  balance: number;
  avatarUrl?: string;
  level?: number;
  experience?: number;
  isActive?: boolean;
  tonWallet?: string;
}

// Тип для внутреннего использования в сервисах
export interface BaseUser {
  telegramId: number;
  username: string;
  balance: number;
  avatarUrl?: string;
  level?: number;
  experience?: number;
  isActive?: boolean;
  tonWallet?: string;
}

export type UserDocument = User & Document;

export interface Game {
  id: string;
  name: string;
  type: GameType;
  players: User[];
  betAmount: number;
  status: 'waiting' | 'playing' | 'finished';
  currentRound?: number;
  rounds?: Array<{
    player1: number;
    player2: number;
    result: 'win' | 'lose' | 'draw';
  }>;
}

export interface GameState {
  gameId: string;
  currentPlayer?: string;
  moves?: any[];
}

export enum WSEvents {
  GAME_STATE_UPDATE = 'gameStateUpdate',
  PLAYER_JOINED = 'playerJoined',
  PLAYER_LEFT = 'playerLeft',
  GAME_STARTED = 'gameStarted'
}

export const verifyToken = (token: string): User => {
  // Реализация верификации JWT
  // Например, используя jsonwebtoken
  return {} as User; // Заглушка, нужно реализовать
}; 