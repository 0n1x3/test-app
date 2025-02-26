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

  // Получение игры по ID
  async getDiceGameById(gameId: string): Promise<Game | null> {
    try {
      const game = await this.gameModel.findById(gameId)
        .populate('players')
        .exec();
      
      return game;
    } catch (error) {
      console.error('Error getting dice game by ID:', error);
      return null;
    }
  }

  // Записываем ход игрока
  async recordDiceMove(gameId: string, userId: number, value: number): Promise<Game> {
    const game = await this.gameModel.findById(gameId)
      .populate('players')
      .exec();
    
    if (!game) {
      throw new Error('Game not found');
    }
    
    // Проверяем, чей ход
    if (game.currentPlayer && game.currentPlayer !== userId.toString()) {
      throw new Error('Not your turn');
    }
    
    // Получение индекса текущего игрока
    const playerIndex = game.players.findIndex(p => 
      p.telegramId === userId
    );
    
    if (playerIndex === -1) {
      throw new Error('Player not found in game');
    }
    
    // Если ещё нет истории раундов, создаем её
    if (!game.rounds) {
      game.rounds = [];
    }
    
    // Если это первый игрок в текущем раунде
    if (!game.rounds[game.currentRound - 1]) {
      game.rounds[game.currentRound - 1] = {
        player1: value,
        player2: 0,
        result: 'draw' // Временное значение
      };
      
      // Переход хода к другому игроку
      const nextPlayerIndex = (playerIndex + 1) % game.players.length;
      const nextPlayer = game.players[nextPlayerIndex];
      game.currentPlayer = nextPlayer.telegramId.toString();
    } 
    // Если это второй игрок в раунде
    else {
      game.rounds[game.currentRound - 1].player2 = value;
      
      // Определяем результат раунда
      const player1Value = game.rounds[game.currentRound - 1].player1;
      const player2Value = value;
      
      let result: 'win' | 'lose' | 'draw';
      
      if (player1Value > player2Value) {
        result = 'win';
      } else if (player1Value < player2Value) {
        result = 'lose';
      } else {
        result = 'draw';
      }
      
      game.rounds[game.currentRound - 1].result = result;
      
      // Отправляем результат раунда
      this.server.to(gameId).emit('roundResult', {
        round: game.currentRound,
        players: game.players.map(p => p.telegramId),
        result,
        player1Value,
        player2Value
      });
      
      // Проверяем, закончилась ли игра
      let player1Wins = 0;
      let player2Wins = 0;
      
      game.rounds.forEach(round => {
        if (round.result === 'win') player1Wins++;
        else if (round.result === 'lose') player2Wins++;
      });
      
      if (player1Wins >= 2 || player2Wins >= 2) {
        game.status = 'finished';
        
        // Определяем победителя
        const winner = player1Wins >= 2 
          ? game.players[0].telegramId 
          : game.players[1].telegramId;
        
        // Отправляем уведомление о завершении игры
        this.server.to(gameId).emit('gameEnd', {
          gameId,
          winner,
          score: [player1Wins, player2Wins]
        });
        
        // Начисляем выигрыш победителю
        const totalBet = game.betAmount * 2;
        await this.transactionsService.processPayout(
          winner,
          totalBet,
          'dice_win'
        );
      } else {
        // Переходим к следующему раунду
        game.currentRound++;
        
        // Первый ход в новом раунде отдаем первому игроку
        game.currentPlayer = game.players[0].telegramId.toString();
      }
    }
    
    await game.save();
    return game;
  }

  // Начало игры в кубики
  async startDiceGame(gameId: string): Promise<Game> {
    const game = await this.gameModel.findById(gameId)
      .populate('players')
      .exec();
    
    if (!game) {
      throw new Error('Game not found');
    }
    
    if (game.players.length !== 2) {
      throw new Error('Game requires exactly 2 players');
    }
    
    game.status = 'playing';
    game.currentRound = 1;
    
    // Выбираем случайно первого игрока
    const randomIndex = Math.floor(Math.random() * 2);
    game.currentPlayer = game.players[randomIndex].telegramId.toString();
    
    await game.save();
    return game;
  }

  // Добавляем метод getGameById в GameService
  async getGameById(gameId: string) {
    try {
      console.log('Getting game by ID:', gameId);
      // Используем модель Game для поиска игры по ID
      const game = await this.gameModel.findById(gameId);
      
      if (!game) {
        console.log('Game not found:', gameId);
        return null;
      }
      
      console.log('Game found:', game);
      return game;
    } catch (error) {
      console.error('Error getting game by ID:', error);
      return null;
    }
  }

  // Другие методы для управления играми
} 