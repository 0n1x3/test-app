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
    currentPlayer?: string;
    moves?: any[];
}
export declare enum WSEvents {
    GAME_STATE_UPDATE = "gameStateUpdate",
    PLAYER_JOINED = "playerJoined",
    PLAYER_LEFT = "playerLeft"
}
