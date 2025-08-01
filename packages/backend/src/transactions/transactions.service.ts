import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transaction } from '../schemas/transaction.schema';
import { GameType, TransactionType } from '../schemas/transaction.schema';
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
      
      // Определяем тип игры из причины выплаты
      const gameType = reason.split('_')[0] as GameType; // 'dice_win' -> 'dice'
      
      // Создаем транзакцию выплаты
      const transaction = new this.transactionModel({
        userId: userId,
        amount: amount,
        type: TransactionType.WIN,
        game: gameType,
        processed: true,
        metadata: {
          reason
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

  // Метод для возврата ставки при удалении игры
  async refundBet(userId: number, amount: number, gameType: GameType): Promise<any> {
    try {
      console.log(`Возврат ставки: ${amount} пользователю ${userId} для игры типа: ${gameType}`);
      
      // Находим пользователя
      const user = await this.userModel.findOne({ telegramId: userId });
      
      if (!user) {
        throw new Error(`User with telegramId ${userId} not found`);
      }
      
      // Создаем транзакцию возврата
      const transaction = new this.transactionModel({
        userId: userId,
        amount: amount,
        type: TransactionType.REWARD,
        game: gameType,
        processed: true,
        metadata: {
          reason: 'game_deleted',
          gameType
        }
      });
      
      await transaction.save();
      
      // Обновляем баланс пользователя
      user.balance += amount;
      await user.save();
      
      return transaction;
    } catch (error) {
      console.error('Error refunding bet:', error);
      throw error;
    }
  }
} 