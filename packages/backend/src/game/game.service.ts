import { Injectable } from '@nestjs/common';
import { Game, GameState, User } from '@test/shared/types';

@Injectable()
export class GameService {
  private games: Map<string, Game> = new Map();
  private gameStates: Map<string, GameState> = new Map();

  createGame(name: string, creator: User): Game {
    const game: Game = {
      id: Math.random().toString(36).substring(7),
      name,
      players: [creator],
      status: 'waiting',
      createdAt: Date.now()
    };
    
    this.games.set(game.id, game);
    return game;
  }

  joinGame(gameId: string, user: User): Game {
    const game = this.games.get(gameId);
    if (!game) throw new Error('Game not found');
    
    if (!game.players.find(p => p.id === user.id)) {
      game.players.push(user);
    }
    
    return game;
  }

  // Другие методы для управления играми
} 