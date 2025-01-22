import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transaction, TransactionType, GameType } from '../schemas/transaction.schema';
import { User } from '../schemas/user.schema';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel(Transaction.name) private transactionModel: Model<Transaction>,
    @InjectModel(User.name) private userModel: Model<User>
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

  async processGameResult(
    userId: number,
    gameType: GameType,
    result: 'win' | 'lose',
    betAmount: number
  ): Promise<void> {
    if (result === 'win') {
      // При выигрыше увеличиваем баланс на удвоенную ставку
      await this.userModel.updateOne(
        { telegramId: userId },
        { $inc: { balance: betAmount * 2 } }
      );

      await this.transactionModel.create({
        userId,
        amount: betAmount * 2,
        type: TransactionType.WIN,
        game: gameType,
        processed: true
      });
    } else {
      // При проигрыше создаем запись о потере
      await this.transactionModel.create({
        userId,
        amount: betAmount,
        type: TransactionType.LOSS,
        game: gameType,
        processed: true
      });
    }
  }
} 