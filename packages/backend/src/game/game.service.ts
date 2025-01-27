import { Injectable } from '@nestjs/common';
import { Game, User, GameState } from '@test-app/shared';
import { Server } from 'socket.io';

@Injectable()
export class GameService {
  private games: Map<string, Game> = new Map();
  private gameStates: Map<string, GameState> = new Map();
  private timers: Map<string, NodeJS.Timeout> = new Map();
  private server: Server;

  setServer(server: Server) {
    this.server = server;
  }

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

  startTurnTimer(lobbyId: string) {
    const timer = setTimeout(() => {
      this.handleTimeout(lobbyId);
    }, 30000); // 30 секунд на ход
    this.timers.set(lobbyId, timer);
  }

  private handleTimeout(lobbyId: string) {
    const game = this.games.get(lobbyId);
    if (game) {
      // Логика обработки таймаута
      this.server.emit('TIMEOUT', { lobbyId });
    }
  }

  startGame(lobbyId: string): Game {
    const game = this.games.get(lobbyId);
    if (!game) throw new Error('Game not found');
    
    game.status = 'playing';
    this.gameStates.set(lobbyId, {
      gameId: lobbyId,
      currentPlayer: game.players[0].id,
      moves: []
    });
    
    return game;
  }

  // Другие методы для управления играми
} 