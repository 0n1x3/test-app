import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transaction, TransactionType, GameType } from '../schemas/transaction.schema';
import { UserEntity, UserDocument } from '../schemas/user.schema';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel(Transaction.name) private transactionModel: Model<Transaction>,
    @InjectModel(UserEntity.name) private userModel: Model<UserDocument>
  ) {}

  async createBet(userId: number, amount: number, game: GameType): Promise<Transaction> {
    // Проверяем баланс пользователя
    const user = await this.userModel.findOne({ telegramId: userId });
    if (!user || user.balance < amount) {
      throw new Error('Insufficient balance');
    }

    // Создаем транзакцию ставки
    const transaction = await this.transactionModel.create({
      userId,
      amount,
      type: TransactionType.BET,
      game,
      processed: false
    });

    // Уменьшаем баланс пользователя
    await this.userModel.updateOne(
      { telegramId: userId },
      { $inc: { balance: -amount } }
    );

    return transaction;
  }

  async processGameResult(params: {
    winnerId: number | null;
    loserId: number | null;
    betAmount: number;
  }): Promise<void> {
    const { winnerId, loserId, betAmount } = params;

    // Добавляем проверки
    if (!winnerId && !loserId) {
      throw new Error('At least one participant must be specified');
    }

    const updates = [];
    
    if (loserId) {
      updates.push(
        this.userModel.updateOne(
          { telegramId: loserId },
          { $inc: { balance: -betAmount } }
        )
      );
    }

    if (winnerId) {
      updates.push(
        this.userModel.updateOne(
          { telegramId: winnerId },
          { $inc: { balance: betAmount } }
        )
      );
    }

    await Promise.all(updates);
  }

  // Добавляем метод выплаты выигрыша
  async processPayout(userId: number, amount: number, reason: string): Promise<any> {
    try {
      console.log(`Processing payout: ${amount} to user ${userId} for reason: ${reason}`);
      
      // Находим пользователя
      const user = await this.userModel.findOne({ telegramId: userId });
      
      if (!user) {
        throw new Error(`User with telegramId ${userId} not found`);
      }
      
      // Создаем транзакцию выплаты
      const transaction = new this.transactionModel({
        user: user._id,
        amount: amount,
        type: 'win',
        status: 'completed',
        metadata: {
          reason,
          gameType: reason.split('_')[0] // 'dice_win' -> 'dice'
        }
      });
      
      await transaction.save();
      
      // Обновляем баланс пользователя
      user.balance += amount;
      await user.save();
      
      return transaction;
    } catch (error) {
      console.error('Error processing payout:', error);
      throw error;
    }
  }
} 