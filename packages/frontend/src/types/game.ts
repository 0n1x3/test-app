export enum GameType {
  RPS = 'rps',
  DICE = 'dice'
}

export interface GameTransaction {
  userId: number;
  amount: number;
  type: 'bet' | 'win' | 'loss';
  game: GameType;
  gameId?: string;
  processed: boolean;
  createdAt: string;
  updatedAt: string;
} 