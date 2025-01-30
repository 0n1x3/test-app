import { Controller, Post, Body, Get, Query, Headers, Param, NotFoundException } from '@nestjs/common';
import { GameService } from './game.service';
import { GameType } from '@test-app/shared';
import { UsersService } from '../users/users.service';

@Controller('games')
export class GameController {
  constructor(
    private gameService: GameService,
    private usersService: UsersService
  ) {}

  @Get('list')
  async getGames(@Query('type') gameType: GameType) {
    const games = await this.gameService.getActiveGames(gameType);
    return { games };
  }

  @Post('create')
  async createGame(@Body() data: { 
    gameType: GameType;
    creatorId: number;
    betAmount: number;
  }) {
    const user = await this.usersService.findByTelegramId(data.creatorId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const game = await this.gameService.createGame(
      data.gameType,
      user,
      data.betAmount
    );
    
    return { 
      success: true,
      game,
      inviteLink: `https://t.me/your_bot_name?start=game_${game.id}`
    };
  }

  @Post('join/:gameId')
  async joinGame(
    @Param('gameId') gameId: string,
    @Body() data: { playerId: number }
  ) {
    const user = await this.usersService.findByTelegramId(data.playerId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const game = await this.gameService.joinGame(gameId, user);
    return { success: true, game };
  }
} 