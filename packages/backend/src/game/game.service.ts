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
      console.log('Creating game with:', { 
        type, 
        creator: { 
          id: creator._id, 
          telegramId: creator.telegramId,
          username: creator.username 
        }, 
        betAmount 
      });
      
      await this.transactionsService.createBet(creator.telegramId, betAmount, type);
      
      const game = new this.gameModel({
        type,
        name: `${creator.username}'s game`,
        players: [creator._id],
        betAmount,
        status: 'waiting',
        createdBy: creator.telegramId.toString() // Используем telegramId как createdBy
      });
      
      const savedGame = await game.save();
      console.log('Saved game with createdBy:', { 
        id: savedGame._id, 
        name: savedGame.name, 
        createdBy: savedGame.createdBy,
        creatorTelegramId: creator.telegramId
      });
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

  async joinGame(gameId: string, user: UserDocument) {
    try {
      console.log(`Попытка присоединиться к игре с ID: ${gameId}`);
      const game = await this.gameModel.findById(gameId).exec();
      
      if (!game) {
        console.log(`Игра с ID ${gameId} не найдена`);
        throw new Error('Game not found');
      }
      
      console.log(`Игра найдена: ${game.name}, тип: ${game.type}, статус: ${game.status}`);
      
      // Проверяем, не является ли пользователь уже игроком
      const isAlreadyPlayer = game.players.some(
        (playerId) => playerId.toString() === user._id.toString()
      );
      
      // Если пользователь уже присоединился, просто возвращаем успех
      if (isAlreadyPlayer) {
        console.log(`Игрок ${user.username} уже присоединен к игре ${gameId}`);
        return game;
      }
      
      // Проверяем статус игры и количество игроков
      if (game.status !== 'waiting') {
        console.log(`Невозможно присоединиться к игре ${gameId} в статусе ${game.status}`);
        throw new Error(`Cannot join game in status ${game.status}`);
      }
      
      if (game.players.length >= 2) {
        console.log(`Игра ${gameId} уже заполнена (${game.players.length} игроков)`);
        throw new Error('Game is full');
      }
      
      // Добавляем игрока в игру
      console.log(`Добавляем игрока ${user.username} в игру ${gameId}`);
      game.players.push(user._id);
      
      // Сохраняем игру перед потенциальным запуском
      await game.save();
      console.log(`Игрок ${user.username} успешно присоединился к игре ${gameId}`);
      
      // Если у нас уже 2 игрока, автоматически запускаем игру в кости
      if (game.players.length === 2 && game.type === 'dice') {
        console.log(`Игра ${gameId} готова к началу с 2 игроками, автоматически запускаем...`);
        
        try {
          // Асинхронно запускаем игру, но не ждем результата здесь
          // чтобы не замедлять ответ на запрос присоединения
          this.startDiceGame(gameId).then(startedGame => {
            console.log(`Игра ${gameId} успешно запущена автоматически`);
          }).catch(error => {
            console.error(`Ошибка при автоматическом запуске игры ${gameId}:`, error);
          });
        } catch (startError) {
          console.error(`Ошибка при подготовке к автоматическому запуску игры ${gameId}:`, startError);
          // Мы не будем выбрасывать ошибку здесь, так как игрок уже успешно присоединился
        }
      } else {
        // Если игра не запускается автоматически, отправляем событие о готовности игры
        if (this.server) {
          this.server.to(`game_${gameId}`).emit('gameReadyToStart', {
            gameId,
            players: game.players.length
          });
        }
      }
      
      return game;
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
    const games = await this.gameModel.find({ 
      type: gameType,
      status: 'waiting'
    })
    .populate('players')
    .lean()
    .exec();
    
    // Преобразуем результаты, чтобы убедиться, что createdBy доступно
    const formattedGames = games.map(game => {
      // Убедимся, что createdBy существует и является строкой
      if (!game.createdBy) {
        console.log(`Game ${game._id} has no createdBy field`);
      }
      
      return {
        ...game,
        createdBy: game.createdBy || null // Гарантируем, что поле существует
      };
    });
    
    console.log('Active games with createdBy field:', formattedGames.map(game => ({
      id: game._id,
      name: game.name,
      createdBy: game.createdBy,
      players: game.players.length
    })));
    
    return formattedGames;
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
    try {
      console.log(`Запуск игры в кости с ID: ${gameId}`);
      
      // Находим игру по ID
      const game = await this.gameModel.findById(gameId).exec();
      
      if (!game) {
        console.error(`Игра с ID ${gameId} не найдена`);
        throw new Error('Game not found');
      }
      
      // Проверяем тип игры
      if (game.type !== 'dice') {
        console.error(`Неверный тип игры: ${game.type}, ожидался: dice`);
        throw new Error('Invalid game type');
      }
      
      // Проверяем количество игроков
      if (game.players.length < 2) {
        console.error(`Недостаточное количество игроков для начала игры: ${game.players.length}`);
        throw new Error('Not enough players to start the game');
      }
      
      // Проверяем статус игры
      if (game.status !== 'waiting') {
        console.error(`Игра уже в статусе: ${game.status}`);
        throw new Error(`Game is already in ${game.status} status`);
      }
      
      // Обновляем статус игры на "playing"
      game.status = 'playing';
      game.currentRound = 1;
      
      // Определяем, кто ходит первым (случайно)
      const firstPlayerIndex = Math.floor(Math.random() * 2); // 0 или 1
      
      // Заполняем игроков актуальными данными
      const populatedPlayers = [];
      for (const playerId of game.players) {
        const player = await this.userModel.findById(playerId).exec();
        if (player) {
          populatedPlayers.push(player);
        }
      }
      
      await game.save();
      
      console.log(`Игра ${gameId} успешно запущена. Первым ходит игрок с индексом ${firstPlayerIndex}`);
      
      // Отправляем событие о начале игры через WebSocket
      if (this.server) {
        this.server.to(`game_${gameId}`).emit('diceGameStarted', {
          gameId,
          firstPlayer: firstPlayerIndex,
          players: populatedPlayers.map(p => ({
            telegramId: p.telegramId,
            username: p.username,
            avatarUrl: p.avatarUrl
          }))
        });
      }
      
      return game;
    } catch (error) {
      console.error('Ошибка при запуске игры в кости:', error);
      throw error;
    }
  }

  // Добавляем метод getGameById в GameService
  async getGameById(gameId: string) {
    try {
      return await this.gameModel.findById(gameId)
        .populate('players')
        .exec();
    } catch (error) {
      console.error('Error getting game by ID:', error);
      return null;
    }
  }

  // Метод для удаления игры
  async deleteGame(gameId: string, userId: number): Promise<boolean> {
    try {
      console.log(`Попытка удаления игры с ID: ${gameId} пользователем: ${userId}`);
      
      // Находим игру
      const game = await this.gameModel.findById(gameId).exec();
      
      if (!game) {
        console.log(`Игра с ID ${gameId} не найдена`);
        throw new Error('Game not found');
      }
      
      console.log('Game found:', {
        id: game._id,
        name: game.name,
        createdBy: game.createdBy,
        userId: userId,
        players: game.players
      });
      
      // Находим пользователя
      const user = await this.userModel.findOne({ telegramId: userId }).exec();
      
      if (!user) {
        console.log(`Пользователь с ID ${userId} не найден`);
        throw new Error('User not found');
      }
      
      console.log('User found:', {
        id: user._id,
        telegramId: user.telegramId,
        username: user.username
      });
      
      // Проверяем, является ли пользователь создателем игры
      // Сначала проверяем по полю createdBy
      let isCreator = false;
      
      if (game.createdBy) {
        isCreator = game.createdBy === userId.toString();
        console.log(`Проверка по createdBy: ${game.createdBy} === ${userId.toString()} = ${isCreator}`);
      }
      
      // Если нет поля createdBy или проверка не прошла, проверяем по первому игроку
      if (!isCreator && game.players.length > 0) {
        isCreator = game.players[0].toString() === user._id.toString();
        console.log(`Проверка по первому игроку: ${game.players[0].toString()} === ${user._id.toString()} = ${isCreator}`);
      }
      
      if (!isCreator) {
        console.log(`Пользователь ${userId} не является создателем игры ${gameId}`);
        throw new Error('User is not the creator of this game');
      }
      
      // Проверяем статус игры - можно удалять только игры в статусе 'waiting'
      if (game.status !== 'waiting') {
        console.log(`Невозможно удалить игру ${gameId} в статусе ${game.status}`);
        throw new Error(`Cannot delete game in status ${game.status}`);
      }
      
      // Удаляем игру
      await this.gameModel.findByIdAndDelete(gameId).exec();
      console.log(`Игра ${gameId} успешно удалена`);
      
      // Возвращаем ставку создателю
      if (game.betAmount > 0) {
        await this.transactionsService.refundBet(user.telegramId, game.betAmount, game.type);
        console.log(`Ставка ${game.betAmount} возвращена пользователю ${userId}`);
      }
      
      // Если есть WebSocket сервер, отправляем уведомление об удалении игры
      if (this.server) {
        this.server.emit('gameDeleted', { gameId });
      }
      
      return true;
    } catch (error) {
      console.error(`Ошибка при удалении игры ${gameId}:`, error);
      throw error;
    }
  }

  // Другие методы для управления играми
} 