import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { TelegramGuard } from '../guards/telegram.guard';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

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
    return this.usersService.findOrCreate({
      id: data.user.id,
      username: data.user.username || data.user.first_name,
      photoUrl: data.user.photo_url
    });
  }

  @Get('test')
  async testUser() {
    return this.usersService.findOrCreate({
      id: 12345,
      username: "test_user",
      photoUrl: "https://example.com/photo.jpg"
    });
  }
}