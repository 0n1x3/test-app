import { Controller, Post, Body, Get, Query, Headers } from '@nestjs/common';
import { GameService } from './game.service';
import { GameType } from '@test-app/shared';

@Controller('api/games')
export class GameController {
  constructor(private gameService: GameService) {}

  @Get('list')
  async getGames(@Headers('authorization') auth: string) {
    try {
      const games = await this.gameService.getActiveGames(GameType.RPS);
      return { 
        success: true, 
        games: games.map(game => ({
          ...game,
          name: game.name || `Game #${game.id}`
        }))
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @Post('create')
  async createGame(@Body() data: { gameType: GameType; creatorId: number; betAmount: number }) {
    try {
      const user = await this.gameService.validateUser(data.creatorId);
      const game = await this.gameService.createGame(
        data.gameType,
        user,
        data.betAmount
      );
      return { 
        success: true, 
        game: {
          ...game.toObject(),
          name: game.name || `Game #${game.id}`
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
} 