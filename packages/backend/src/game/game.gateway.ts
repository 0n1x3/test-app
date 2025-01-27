import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameService } from './game.service';
import { Game, User, WSEvents, verifyToken } from '@test-app/shared';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000'],
    credentials: true,
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
    @MessageBody() data: { name: string; creator: User },
  ) {
    const game = this.gameService.createGame(data.name, data.creator);
    this.server.emit(WSEvents.GAME_STATE_UPDATE, game);
    return { success: true, game };
  }

  @SubscribeMessage('joinGame')
  async handleJoinGame(
    @MessageBody() data: { gameId: string; user: User },
  ) {
    const game = this.gameService.joinGame(data.gameId, data.user);
    this.server.emit(WSEvents.PLAYER_JOINED, { game });
    return { success: true, game };
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