import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody } from '@nestjs/websockets';
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
  async handleJoinGameRoom(@MessageBody() data: { gameId: string }, client: Socket) {
    try {
      console.log('Client joining game room:', data.gameId, 'Client ID:', client.id);
      
      // Добавляем клиента в комнату
      client.join(data.gameId);
      
      // Получаем текущее состояние игры и отправляем его только этому клиенту
      const gameState = await this.gameService.getGameById(data.gameId);
      if (gameState) {
        client.emit('gameState', gameState);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error joining game room:', error);
      return { success: false, error: error.message };
    }
  }

  handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;
      const user = verifyToken(token);
      client.data.user = user;
    } catch (e) {
      client.disconnect(true);
    }
  }
} 