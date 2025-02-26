import { Injectable } from '@nestjs/common';
import { Game, GameType, GameState, User } from '@test-app/shared';
import { Server } from 'socket.io';
import { TransactionsService } from '../transactions/transactions.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument, toUser } from '../schemas/user.schema';

@Injectable()
export class GameService {
  private games: Map<string, Game> = new Map();
  private gameStates: Map<string, GameState> = new Map();
  private timers: Map<string, NodeJS.Timeout> = new Map();
  private server: Server;

  constructor(
    private transactionsService: TransactionsService,
    @InjectModel('Game') private gameModel: Model<Game>,
    @InjectModel('User') private userModel: Model<UserDocument>
  ) {}

  setServer(server: Server) {
    this.server = server;
  }

  async createGame(type: GameType, creator: UserDocument, betAmount: number) {
    try {
      console.log('Creating game with:', { type, creator: creator.toObject(), betAmount });
      
      await this.transactionsService.createBet(creator.telegramId, betAmount, type);
      
      const game = new this.gameModel({
        type,
        name: `${creator.username}'s game`,
        players: [creator._id],
        betAmount,
        status: 'waiting'
      });
      
      const savedGame = await game.save();
      console.log('Saved game:', savedGame);
      return savedGame;
    } catch (error) {
      console.error('Error in createGame:', error);
      throw error;
    }
  }

  async validateUser(userId: number): Promise<UserDocument> {
    const user = await this.userModel.findOne({ telegramId: userId });
    if (!user) throw new Error('User not found');
    return user;
  }

  async joinGame(gameId: string, userDoc: UserDocument): Promise<Game> {
    try {
      console.log(`Попытка присоединиться к игре с ID: ${gameId}`);
      
      // Ищем игру в MongoDB вместо локального хранилища
      const game = await this.gameModel.findById(gameId).exec();
      
      if (!game) {
        console.error(`Игра с ID ${gameId} не найдена в базе данных`);
        throw new Error(`Game with ID ${gameId} not found`);
      }
      
      console.log(`Игра найдена: ${game.name}, тип: ${game.type}, статус: ${game.status}`);
      
      // Проверяем статус игры
      if (game.status !== 'waiting') {
        console.error(`Невозможно присоединиться к игре ${gameId} в статусе ${game.status}`);
        throw new Error(`Cannot join game in status ${game.status}`);
      }
      
      // Проверяем, не присоединился ли уже этот игрок
      const playerExists = game.players.some(
        (playerId) => playerId.toString() === userDoc._id.toString()
      );
      
      if (playerExists) {
        console.log(`Игрок ${userDoc.username} уже присоединён к игре ${gameId}`);
        return game;
      }
      
      // Проверяем, не заполнена ли игра
      if (game.type === 'dice' && game.players.length >= 2) {
        console.error(`Игра ${gameId} уже заполнена (${game.players.length} игроков)`);
        throw new Error('Game is already full');
      }
      
      // Добавляем игрока в игру
      console.log(`Добавляем игрока ${userDoc.username} в игру ${gameId}`);
      game.players.push(userDoc._id);
      
      // Если игра заполнена, меняем статус
      if (game.type === 'dice' && game.players.length >= 2) {
        game.status = 'playing';
      }
      
      // Сохраняем обновленную игру
      const updatedGame = await game.save();
      console.log(`Игрок ${userDoc.username} успешно присоединился к игре ${gameId}`);
      
      // Если есть WebSocket сервер, отправляем уведомление
      if (this.server) {
        this.server.emit('gameUpdated', { 
          gameId: updatedGame.id,
          game: updatedGame
        });
      }
      
      return updatedGame;
    } catch (error) {
      console.error(`Ошибка при присоединении к игре ${gameId}:`, error);
      throw error;
    }
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

  async getActiveGames(gameType: GameType) {
    return this.gameModel.find({ 
      type: gameType,
      status: 'waiting'
    })
    .populate('players')
    .lean()
    .exec();
  }

  // Другие методы для управления играми
} 