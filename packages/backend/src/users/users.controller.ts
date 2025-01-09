import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { TelegramGuard } from '../guards/telegram.guard';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('init')
  @UseGuards(TelegramGuard)
  async initUser(@Body() telegramData: any) {
    return this.usersService.findOrCreate(telegramData);
  }
}