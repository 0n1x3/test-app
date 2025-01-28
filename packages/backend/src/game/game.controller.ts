import { Controller, Post, Body } from '@nestjs/common';
import { GameService } from './game.service';

@Controller('games')
export class GameController {
  constructor(private gameService: GameService) {}

  @Post('create')
  async createGame(@Body() data: { betAmount: number }) {
    const game = this.gameService.createGame('New Game', {
      id: 'temp-id',
      address: '',
      balance: data.betAmount.toString()
    });
    return { success: true, game };
  }
} 