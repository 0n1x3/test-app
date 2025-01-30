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
  port: 3005
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