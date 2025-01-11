import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { TelegramGuard } from '../guards/telegram.guard';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('test')
  async testConnection() {
    console.log('MongoDB URI:', process.env.MONGODB_URI);
    return { status: 'ok', message: 'API is working' };
  }

  @Post('init')
  @UseGuards(TelegramGuard)
  async initUser(@Body() data: any) {
    console.log('Init user data:', data);
    try {
      const result = await this.usersService.createOrUpdateUser({
        telegramId: data.user.id,
        username: data.user.username || data.user.first_name,
        avatarUrl: data.user.photo_url,
      });
      console.log('Created/Updated user:', result);
      return result;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }
}