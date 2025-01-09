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
  async initUser(@Body() data: { 
    initData: string;
    user: {
      id: number;
      username: string;
      first_name: string;
      photo_url?: string;
    }
  }) {
    console.log('Received user data:', data);
    return this.usersService.findOrCreate({
      id: data.user.id,
      username: data.user.username || data.user.first_name,
      photoUrl: data.user.photo_url
    });
  }
}