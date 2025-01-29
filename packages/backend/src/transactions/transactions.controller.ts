import { Controller, Post, Body } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { GameType } from '../schemas/transaction.schema';

@Controller('transactions')
export class TransactionsController {
  constructor(private transactionsService: TransactionsService) {}

  @Post('bet')
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
  async processGameResult(
    @Body() data: { 
      userId: number; 
      game: GameType; 
      result: 'win' | 'lose';
      betAmount: number;
    }
  ) {
    try {
      await this.transactionsService.processGameResult({
        winnerId: data.result === 'win' ? data.userId : null,
        loserId: data.result === 'lose' ? data.userId : null,
        betAmount: data.betAmount
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
} 