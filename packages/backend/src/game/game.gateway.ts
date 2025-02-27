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

  constructor(private gameService: GameService) {}

  afterInit() {
    this.gameService.setServer(this.server);
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

  @SubscribeMessage('diceMove')
  async handleDiceMove(
    @MessageBody() data: { gameId: string; value: number; userId: number }
  ) {
    try {
      console.log('Dice move:', data);
      const game = await this.gameService.getDiceGameById(data.gameId);
      
      if (!game) {
        return { success: false, error: 'Game not found' };
      }
      
      // Находим индекс игрока
      const playerIndex = game.players.findIndex(
        playerId => playerId.toString() === data.userId.toString()
      );
      
      if (playerIndex === -1) {
        return { success: false, error: 'Player not in game' };
      }
      
      // Обновляем состояние игры
      const updatedGame = await this.gameService.recordDiceMove(
        data.gameId,
        data.userId,
        data.value
      );
      
      // Сообщаем всем подключенным клиентам о ходе
      this.server.to(data.gameId).emit('diceMove', {
        gameId: data.gameId,
        userId: data.userId,
        value: data.value,
        nextMove: updatedGame.currentPlayer
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
      const game = await this.gameService.startDiceGame(data.gameId);
      
      // Используем оператор опционального доступа для предотвращения ошибок
      this.server.to(data.gameId).emit('diceGameStarted', {
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
      
      // Покидаем все другие комнаты игр
      const rooms = Object.keys(client.rooms);
      for (const room of rooms) {
        if (room !== client.id && room.startsWith('game_')) {
          client.leave(room);
        }
      }
      
      // Присоединяемся к новой комнате
      client.join(`game_${gameId}`);
      console.log(`Клиент ${client.id} успешно присоединился к комнате game_${gameId}`);
      
      return { success: true };
    } catch (error) {
      console.error('Error joining game room:', error);
      return { success: false, error: error.message };
    }
  }

  handleConnection(client: Socket) {
    try {
      console.log(`Новое WebSocket соединение: ${client.id}`);
      const token = client.handshake.auth.token;
      
      // Пока просто сохраняем базовые данные для работы
      if (!token) {
        client.data = { user: { id: client.id, username: `guest_${client.id.slice(0, 5)}` } };
        console.log(`Анонимный пользователь: ${client.id}`);
        return;
      }
      
      try {
        const user = verifyToken(token);
        client.data.user = user;
        console.log(`Аутентифицированный пользователь: ${user.username || user.id}`);
      } catch (e) {
        console.warn(`Ошибка верификации токена: ${e.message}`);
        client.data = { user: { id: client.id, username: `guest_${client.id.slice(0, 5)}` } };
      }
    } catch (e) {
      console.error('Ошибка при обработке подключения WebSocket:', e);
      client.disconnect(true);
    }
  }
} 