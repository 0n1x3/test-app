import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { GameType } from '../schemas/transaction.schema';
import { TelegramGuard } from '../guards/telegram.guard';

@Controller('api/transactions')
export class TransactionsController {
  constructor(private transactionsService: TransactionsService) {}

  @Post('bet')
  @UseGuards(TelegramGuard)
  async createBet(
    @Body() data: { userId: number; amount: number; game: GameType }
  ) {
    try {
      console.log('Creating bet with data:', data);
      const transaction = await this.transactionsService.createBet(
        data.userId,
        data.amount,
        data.game
      );
      console.log('Created transaction:', transaction);
      return { success: true, transaction };
    } catch (error) {
      console.error('Error in createBet:', error);
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