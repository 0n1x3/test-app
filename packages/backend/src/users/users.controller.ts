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
  async initUser(@Body() data: any) {
    console.log('1. Raw request data:', JSON.stringify(data, null, 2));
    
    try {
      // Парсим данные пользователя из URL-encoded строки
      const params = new URLSearchParams(data.initData);
      console.log('2. Parsed URL params:', Array.from(params.entries()));
      
      const userStr = params.get('user');
      console.log('3. User string:', userStr);
      
      if (!userStr) {
        throw new Error('No user data found');
      }

      const user = JSON.parse(decodeURIComponent(userStr));
      console.log('4. Parsed user data:', user);

      const result = await this.usersService.createOrUpdateUser({
        telegramId: user.id,
        username: user.username || user.first_name,
        avatarUrl: user.photo_url,
      });
      console.log('5. Created/Updated user:', result);

      return result;
    } catch (error) {
      console.error('Error processing request:', error);
      throw new Error(`Failed to process request: ${error.message}`);
    }
  }
}