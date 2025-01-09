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
}