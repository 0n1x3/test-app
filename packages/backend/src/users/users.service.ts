import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';
import { TasksService } from '../tasks/tasks.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private tasksService: TasksService
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
      const existingUser = await this.userModel.findOne({ telegramId });

      if (existingUser) {
        return this.userModel.findOneAndUpdate(
          { telegramId },
          { 
            username,
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
          level: 1,
          experience: 0,
          completedTasks: [],
          isActive: true
        });
        await newUser.save();
        
        // Инициализируем задачи для нового пользователя
        await this.tasksService.initDefaultTasks();
        
        return newUser;
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

  async initUser(telegramId: number, username: string): Promise<User> {
    const existingUser = await this.userModel.findOne({ telegramId });
    if (existingUser) return existingUser;

    return this.userModel.create({
      telegramId,
      username,
      level: 1,
      experience: 0,
      balance: 0,
      completedTasks: [], // Явно инициализируем пустым массивом
      isActive: true
    });
  }

  async deleteUser(telegramId: number): Promise<void> {
    await this.userModel.deleteOne({ telegramId });
  }
}