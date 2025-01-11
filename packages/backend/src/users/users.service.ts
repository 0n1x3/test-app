import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>
  ) {}

  async findOrCreate(telegramData: {
    id: number;
    username: string;
    photoUrl?: string;
  }): Promise<User> {
    let user = await this.userModel.findOne({ telegramId: telegramData.id });
    
    if (!user) {
      user = new this.userModel({
        telegramId: telegramData.id,
        username: telegramData.username,
        avatarUrl: telegramData.photoUrl,
        isActive: true
      });
      await user.save();
    }

    return user;
  }

  async updateTonWallet(telegramId: number, wallet: string): Promise<User> {
    return this.userModel.findOneAndUpdate(
      { telegramId },
      { tonWallet: wallet },
      { new: true }
    );
  }

  async createOrUpdateUser(userData: {
    telegramId: number;
    username: string;
    avatarUrl?: string;
  }): Promise<User> {
    const { telegramId, username, avatarUrl } = userData;

    try {
      // Ищем пользователя по telegramId
      const existingUser = await this.userModel.findOne({ telegramId });

      if (existingUser) {
        // Обновляем существующего пользователя
        return this.userModel.findOneAndUpdate(
          { telegramId },
          { 
            username,
            avatarUrl,
            isActive: true
          },
          { new: true }
        );
      } else {
        // Создаем нового пользователя
        const newUser = new this.userModel({
          telegramId,
          username,
          avatarUrl,
          balance: 0,
          isActive: true
        });
        return newUser.save();
      }
    } catch (error) {
      console.error('Error in createOrUpdateUser:', error);
      throw error;
    }
  }

  async updateAvatar(telegramId: number, avatarUrl: string): Promise<User> {
    return this.userModel.findOneAndUpdate(
      { telegramId },
      { avatarUrl },
      { new: true }
    );
  }
}