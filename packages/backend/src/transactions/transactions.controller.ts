import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { GameType } from '../schemas/transaction.schema';
import { TelegramGuard } from '../guards/telegram.guard';

@Controller('transactions')
export class TransactionsController {
  constructor(private transactionsService: TransactionsService) {}

  @Post('bet')
  @UseGuards(TelegramGuard)
  async createBet(
    @Body() data: { userId: number; amount: number; game: GameType }
  ) {
    try {
      const transaction = await this.transactionsService.createBet(
        data.userId,
        data.amount,
        data.game
      );
      return { success: true, transaction };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @Post('result')
  @UseGuards(TelegramGuard)
  async processGameResult(
    @Body() data: { 
      userId: number; 
      game: GameType; 
      result: 'win' | 'lose';
      betAmount: number;
    }
  ) {
    try {
      await this.transactionsService.processGameResult(
        data.userId,
        data.game,
        data.result,
        data.betAmount
      );
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
} 