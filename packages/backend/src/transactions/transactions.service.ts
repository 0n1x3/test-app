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

  async processGameResult(params: {
    winnerId: number;
    loserId: number;
    betAmount: number;
  }): Promise<void> {
    const { winnerId, loserId, betAmount } = params;

    // Уменьшаем баланс проигравшего
    await this.userModel.updateOne(
      { telegramId: loserId },
      { $inc: { balance: -betAmount } }
    );

    // Увеличиваем баланс победителя
    await this.userModel.updateOne(
      { telegramId: winnerId },
      { $inc: { balance: betAmount } }
    );

    // Создаем транзакции
    await Promise.all([
      this.transactionModel.create({
        userId: winnerId,
        amount: betAmount,
        type: TransactionType.WIN,
        game: GameType.DICE, // или другой тип игры
        processed: true
      }),
      this.transactionModel.create({
        userId: loserId,
        amount: betAmount,
        type: TransactionType.LOSS,
        game: GameType.DICE,
        processed: true
      })
    ]);
  }
} 