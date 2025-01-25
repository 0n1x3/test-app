import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { createHash, createHmac } from 'crypto';

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
      const params = new URLSearchParams(initData);
      const hash = params.get('hash');
      
      if (!hash) return false;

      // Создаем строку для проверки
      const data = Array.from(params.entries())
        .filter(([key]) => key !== 'hash')
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');

      // Создаем ключ из токена бота
      const secretKey = createHash('sha256')
        .update(this.BOT_TOKEN)
        .digest();

      // Создаем хеш для проверки
      const generatedHash = createHmac('sha256', secretKey)
        .update(data)
        .digest('hex');

      console.log('Debug:', {
        data,
        hash,
        generatedHash
      });

      return hash === generatedHash;
    } catch (error) {
      console.error('Error in TelegramGuard:', error);
      return false;
    }
  }
} 