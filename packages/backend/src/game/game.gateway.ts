import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameService } from './game.service';
import { Game, User, WSEvents, verifyToken } from '@test-app/shared';
import { GameType } from '@test-app/shared';
import { UserDocument } from '../schemas/user.schema';

@WebSocketGateway({
  cors: {
    origin: [
      'https://test.timecommunity.xyz',
      'http://localhost:3000'
    ],
    methods: ['GET', 'POST'],
    credentials: true
  },
  port: 3005,
  path: '/socket.io'
})
export class GameGateway {
  @WebSocketServer()
  server!: Server;

  // Карта для отслеживания активных подключений по gameId
  private activeConnections: Map<string, Set<string>> = new Map();

  constructor(private gameService: GameService) {}

  afterInit() {
    this.gameService.setServer(this.server);
    console.log('WebSocket Gateway initialized');
  }

  @SubscribeMessage('createGame')
  async handleCreateGame(
    @MessageBody() data: { 
      gameType: GameType,
      creator: UserDocument,
      betAmount: number 
    },
  ) {
    try {
      console.log('Creating game with data:', data);
      const game = await this.gameService.createGame(
        data.gameType,
        data.creator,
        data.betAmount
      );
      console.log('Created game:', game);
      this.server.emit(WSEvents.GAME_STATE_UPDATE, game.toObject());
      return { success: true, game: game.toObject() };
    } catch (error) {
      console.error('Error creating game:', error);
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('joinGame')
  async handleJoinGame(@MessageBody() data: { gameId: string; user: User }) {
    const userDoc = await this.gameService.validateUser(data.user.telegramId);
    const game = await this.gameService.joinGame(data.gameId, userDoc);
    this.server.to(game.id).emit(WSEvents.PLAYER_JOINED, { game });
    return { success: true, game };
  }

  @SubscribeMessage('startGame')
  async handleStartGame(
    @MessageBody() data: { gameId: string },
  ) {
    const game = this.gameService.startGame(data.gameId);
    this.server.to(game.id).emit(WSEvents.GAME_STARTED, { game });
  }

  @SubscribeMessage('getGames')
  async handleGetGames() {
    // Здесь должна быть логика получения списка игр
    return { games: [] };
  }

  @SubscribeMessage('getGameStatus')
  async handleGetGameStatus(@MessageBody() data: { gameId: string }) {
    try {
      const game = await this.gameService.getGameById(data.gameId);
      
      if (!game) {
        return { success: false, error: 'Game not found' };
      }
      
      return { 
        success: true, 
        status: game.status,
        currentRound: game.currentRound,
        currentPlayer: game.currentPlayer,
        players: game.players.map(p => ({
          telegramId: p.telegramId,
          username: p.username,
          avatarUrl: p.avatarUrl
        }))
      };
    } catch (error) {
      console.error('Error getting game status:', error);
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('updateGame')
  async handleUpdateGame(@MessageBody() data: { gameId: string }) {
    try {
      console.log(`Запрос на обновление игры с ID: ${data.gameId}`);
      
      const game = await this.gameService.getGameById(data.gameId);
      
      if (!game) {
        console.error(`Игра с ID ${data.gameId} не найдена`);
        return { success: false, error: 'Game not found' };
      }
      
      // Отправляем данные игры клиенту, который запросил обновление
      return { 
        success: true, 
        game: {
          id: game.id,
          _id: game._id,
          status: game.status,
          currentRound: game.currentRound,
          currentPlayer: game.currentPlayer,
          players: game.players,
          betAmount: game.betAmount,
          type: game.type,
          rounds: game.rounds
        }
      };
    } catch (error) {
      console.error('Error updating game:', error);
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('getGamePlayers')
  async handleGetGamePlayers(@MessageBody() data: { gameId: string }) {
    try {
      console.log(`Получен запрос на получение игроков для игры с ID: ${data.gameId}`);
      
      const game = await this.gameService.getGameById(data.gameId);
      
      if (!game) {
        console.error(`Игра с ID ${data.gameId} не найдена`);
        return { success: false, error: 'Game not found' };
      }
      
      // Получаем данные игроков
      const players = [];
      for (const playerId of game.players) {
        const player = await this.gameService.validateUser(playerId.telegramId);
        if (player) {
          players.push({
            telegramId: player.telegramId,
            username: player.username,
            avatarUrl: player.avatarUrl
          });
        }
      }
      
      // Отправляем игрокам
      this.server.to(`game_${data.gameId}`).emit('gamePlayers', {
        players
      });
      
      return { success: true, players };
    } catch (error) {
      console.error('Error getting game players:', error);
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('diceMove')
  async handleDiceMove(
    @MessageBody() data: { gameId: string; value: number; telegramId: number }
  ) {
    try {
      console.log('Dice move:', data);
      const game = await this.gameService.getDiceGameById(data.gameId);
      
      if (!game) {
        return { success: false, error: 'Game not found' };
      }
      
      // Проверяем, что игра в статусе 'playing'
      if (game.status !== 'playing') {
        console.error(`Попытка хода в игре, которая не в статусе playing: ${game.status}`);
        return { success: false, error: 'Game is not in playing status' };
      }
      
      // Проверяем, чей ход
      if (game.currentPlayer && game.currentPlayer !== data.telegramId.toString()) {
        console.error(`Не ваш ход: текущий игрок ${game.currentPlayer}, вы пытаетесь ходить как ${data.telegramId}`);
        return { success: false, error: 'Not your turn' };
      }
      
      // Находим индекс игрока
      const playerIndex = game.players.findIndex(
        playerId => playerId.toString() === data.telegramId.toString()
      );
      
      if (playerIndex === -1) {
        return { success: false, error: 'Player not in game' };
      }
      
      // Обновляем состояние игры
      const updatedGame = await this.gameService.recordDiceMove(
        data.gameId,
        data.telegramId,
        data.value
      );
      
      // Получаем индекс следующего игрока
      const nextPlayerIndex = updatedGame.players.findIndex(
        playerId => playerId.toString() === updatedGame.currentPlayer
      );
      
      // Имя следующего игрока
      const nextPlayerName = nextPlayerIndex >= 0 ? 
        await this.gameService.getUsernameById(updatedGame.currentPlayer) : 
        'unknown';
      
      console.log(`Ход переходит к игроку ${updatedGame.currentPlayer} (${nextPlayerName})`);
      
      // Сообщаем всем подключенным клиентам о ходе
      this.server.to(`game_${data.gameId}`).emit('diceMove', {
        gameId: data.gameId,
        telegramId: data.telegramId,
        value: data.value,
        nextMove: updatedGame.currentPlayer,
        round: updatedGame.currentRound,
        timestamp: Date.now()
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error handling dice move:', error);
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('startDiceGame')
  async handleStartDiceGame(
    @MessageBody() data: { gameId: string }
  ) {
    try {
      // Сначала проверяем текущий статус игры
      const existingGame = await this.gameService.getGameById(data.gameId);
      
      // Если игра уже в процессе или завершена, не запускаем её снова
      if (existingGame && existingGame.status === 'playing') {
        console.log(`Игра ${data.gameId} уже запущена, пропускаем запрос на запуск`);
        return { 
          success: true, 
          message: 'Game is already started', 
          game: existingGame 
        };
      }
      
      if (existingGame && existingGame.status === 'finished') {
        console.log(`Игра ${data.gameId} уже завершена, пропускаем запрос на запуск`);
        return { 
          success: false, 
          error: 'Game is already finished'
        };
      }
      
      // Если игра в статусе 'waiting' или статус не определен, запускаем игру
      const game = await this.gameService.startDiceGame(data.gameId);
      
      // Используем оператор опционального доступа для предотвращения ошибок
      this.server.to(`game_${data.gameId}`).emit('diceGameStarted', {
        gameId: data.gameId,
        firstPlayer: game.currentPlayer ?? '',
        status: 'playing'
      });
      
      return { success: true, game };
    } catch (error) {
      console.error('Error starting dice game:', error);
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('joinGameRoom')
  async handleJoinGameRoom(
    @MessageBody() data: { gameId: string },
    @ConnectedSocket() client: Socket
  ) {
    try {
      const { gameId } = data;
      console.log(`Клиент ${client.id} пытается присоединиться к комнате игры ${gameId}`);
      
      // Проверяем, есть ли данные пользователя
      if (!client.data || !client.data.user) {
        console.warn('Нет данных пользователя в сокете:', client.id);
        return { success: false, error: 'Не авторизован' };
      }
      
      // Получаем ID пользователя и его имя (если есть)
      const userId = client.data.user.id || 'unknown';
      const username = client.data.user.username || 'unknown';
      
      console.log(`Пользователь ${username} (${userId}) присоединяется к комнате ${gameId}`);
      
      // Получаем информацию об игре
      const game = await this.gameService.getGameById(gameId);
      if (!game) {
        console.error(`Игра с ID ${gameId} не найдена`);
        return { success: false, error: 'Game not found' };
      }
      
      // Покидаем все другие комнаты игр
      const rooms = Object.keys(client.rooms);
      for (const room of rooms) {
        if (room !== client.id && room.startsWith('game_')) {
          client.leave(room);
        }
      }
      
      // Присоединяемся к комнате игры
      const roomName = `game_${gameId}`;
      client.join(roomName);
      console.log(`Клиент ${client.id} успешно присоединился к комнате ${roomName}`);
      
      // Сохраняем gameId в данных клиента
      client.data.gameId = gameId;
      
      // Обновляем список активных подключений
      if (!this.activeConnections.has(gameId)) {
        this.activeConnections.set(gameId, new Set());
      }
      this.activeConnections.get(gameId)?.add(client.id);
      
      // Отправляем актуальное состояние игры клиенту
      client.emit('gameStatus', {
        gameId,
        status: game.status,
        currentRound: game.currentRound,
        currentPlayer: game.currentPlayer,
        players: game.players.map(p => ({
          telegramId: p.telegramId,
          username: p.username,
          avatarUrl: p.avatarUrl
        }))
      });
      
      // Отправляем обновление о статусе подключения
      await this.updateConnectionStatus(gameId);
      
      return { success: true };
    } catch (error) {
      console.error('Error joining game room:', error);
      return { success: false, error: error.message };
    }
  }

  // Обработчик подключения клиента
  handleConnection(client: Socket) {
    console.log(`Новое WebSocket соединение: ${client.id}`);
    
    // Получаем данные пользователя из запроса
    const telegramId = client.handshake.query.telegramId;
    const userId = client.handshake.query.userId;
    const gameId = client.handshake.query.gameId as string;
    
    // Сохраняем данные пользователя в объекте сокета
    client.data = {
      user: {
        id: telegramId || userId,
        username: client.handshake.query.username || 'unknown'
      },
      gameId
    };
    
    console.log(`Аутентифицированный пользователь: ${client.data.user?.id}`);
    
    // Если есть gameId, добавляем клиента в список активных подключений для этой игры
    if (gameId) {
      if (!this.activeConnections.has(gameId)) {
        this.activeConnections.set(gameId, new Set());
      }
      this.activeConnections.get(gameId)?.add(client.id);
      
      // Отправляем обновление о статусе подключения всем клиентам в этой игре
      this.updateConnectionStatus(gameId);
    }
  }

  // Обработчик отключения клиента
  handleDisconnect(client: Socket) {
    console.log(`WebSocket соединение закрыто: ${client.id}`);
    
    // Получаем gameId из данных клиента
    const gameId = client.data?.gameId;
    
    // Если есть gameId, удаляем клиента из списка активных подключений
    if (gameId && this.activeConnections.has(gameId)) {
      this.activeConnections.get(gameId)?.delete(client.id);
      
      // Отправляем обновление о статусе подключения всем оставшимся клиентам
      this.updateConnectionStatus(gameId);
    }
  }

  // Метод для отправки обновления о статусе подключения
  private async updateConnectionStatus(gameId: string) {
    const connectedClients = this.activeConnections.get(gameId)?.size || 0;
    
    console.log(`Обновление статуса подключения для игры ${gameId}: ${connectedClients} активных клиентов`);
    
    this.server.to(`game_${gameId}`).emit('connectionStatus', {
      gameId,
      connectedClients,
      timestamp: Date.now()
    });

    // Если подключены два клиента, проверяем статус игры и отправляем дополнительное событие
    if (connectedClients === 2) {
      const game = await this.gameService.getGameById(gameId);
      
      if (game) {
        // Отправляем информацию о текущем статусе игры
        this.server.to(`game_${gameId}`).emit('gameStatus', {
          gameId,
          status: game.status,
          currentRound: game.currentRound,
          currentPlayer: game.currentPlayer,
          players: game.players
        });
      }
    }
  }
} 