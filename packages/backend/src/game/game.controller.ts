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
    type: GameType; 
    betAmount: number;
    initData: string;
  }) {
    try {
      // Парсим данные пользователя из initData
      const params = new URLSearchParams(data.initData);
      const userStr = params.get('user');
      
      if (!userStr) {
        throw new Error('No user data found');
      }

      const userData = JSON.parse(decodeURIComponent(userStr));
      const user = await this.usersService.findByTelegramId(userData.id);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const game = await this.gameService.createGame(data.type, user, data.betAmount);

      return { 
        success: true,
        game,
        inviteLink: `https://t.me/neometria_bot/game?startapp=${game.id}`
      };
    } catch (error) {
      console.error('Error creating game:', error);
      throw error;
    }
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

  @Get('active')
  async getActiveGames(@Query('type') type: GameType) {
    try {
      const games = await this.gameService.getActiveGames(type);
      console.log('Active games:', games); // Для отладки
      return { success: true, games };
    } catch (error) {
      console.error('Error getting active games:', error);
      throw error;
    }
  }
} 