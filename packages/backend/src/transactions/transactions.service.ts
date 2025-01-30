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
} 