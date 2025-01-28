import { Injectable } from '@nestjs/common';
import { Game, GameType, User, GameState } from '@test-app/shared';
import { Server } from 'socket.io';
import { TransactionsService } from '../transactions/transactions.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class GameService {
  private games: Map<string, Game> = new Map();
  private gameStates: Map<string, GameState> = new Map();
  private timers: Map<string, NodeJS.Timeout> = new Map();
  private server: Server;

  constructor(
    private transactionsService: TransactionsService,
    @InjectModel('Game') private gameModel: Model<Game>,
    @InjectModel('User') private userModel: Model<User>
  ) {}

  setServer(server: Server) {
    this.server = server;
  }

  async createGame(type: GameType, creator: User, betAmount: number) {
    await this.transactionsService.createBet(creator.telegramId, betAmount, type);
    
    const game = new this.gameModel({
      type,
      players: [creator],
      betAmount,
      status: 'waiting',
      createdAt: new Date()
    });
    
    return game.save();
  }

  async validateUser(userId: number): Promise<User> {
    const user = await this.userModel.findOne({ telegramId: userId });
    if (!user) throw new Error('User not found');
    return user;
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

  async getActiveGames(gameType: GameType): Promise<Game[]> {
    return this.gameModel.find({ 
      type: gameType,
      status: 'waiting'
    }).populate('players');
  }

  // Другие методы для управления играми
} 