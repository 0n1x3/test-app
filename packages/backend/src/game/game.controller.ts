import { Controller, Post, Body, Get, Query, UseGuards } from '@nestjs/common';
import { GameService } from './game.service';
import { TelegramGuard } from '../guards/telegram.guard';
import { GameType } from '@test-app/shared';

@Controller('games')
export class GameController {
  constructor(private gameService: GameService) {}

  @Get()
  async getActiveGames(@Query('type') gameType: GameType) {
    const games = await this.gameService.getActiveGames(gameType);
    return { games };
  }

  @Post('create')
  @UseGuards(TelegramGuard)
  async createGame(
    @Body() data: { 
      betAmount: number,
      gameType: GameType,
      creatorId: number 
    }
  ) {
    const user = await this.gameService.validateUser(data.creatorId);
    const game = await this.gameService.createGame(
      data.gameType,
      user,
      data.betAmount
    );
    return { 
      success: true, 
      gameId: game.id,
      inviteLink: `https://t.me/neometria_bot/game?id=${game.id}`
    };
  }
} 