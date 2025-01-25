import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { createHash, createHmac } from 'crypto';
import { TelegramInitData } from '../utils/telegram-init-data';

@Injectable()
export class TelegramGuard implements CanActivate {
  private readonly BOT_TOKEN: string;

  constructor() {
    if (!process.env.BOT_TOKEN) {
      throw new Error('BOT_TOKEN is required');
    }
    this.BOT_TOKEN = process.env.BOT_TOKEN;
  }

  canActivate(context: ExecutionContext): boolean {
    try {
      const request = context.switchToHttp().getRequest();
      const authHeader = request.headers.authorization;
      
      if (!authHeader?.startsWith('Bearer ')) {
        return false;
      }

      const initData = authHeader.slice(7);
      const telegramData = new TelegramInitData(initData);
      
      return telegramData.validate(this.BOT_TOKEN);
    } catch (error) {
      console.error('Error in TelegramGuard:', error);
      return false;
    }
  }
} 