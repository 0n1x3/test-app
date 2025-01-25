import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { createHash, createHmac } from 'crypto';

@Injectable()
export class TelegramGuard implements CanActivate {
  private readonly BOT_TOKEN: string;

  constructor() {
    if (!process.env.BOT_TOKEN) {
      console.error('BOT_TOKEN is not set');
      throw new Error('BOT_TOKEN is required');
    }
    // Берем только секретную часть токена
    const [botId, timestamp, secret] = process.env.BOT_TOKEN.split(':');
    this.BOT_TOKEN = secret || process.env.BOT_TOKEN;
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

      // Удаляем hash и signature из параметров
      params.delete('hash');
      params.delete('signature');
      
      // Создаем отсортированную строку для проверки
      const dataCheckString = Array.from(params.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');

      const secretKey = createHash('sha256')
        .update(this.BOT_TOKEN)
        .digest();

      const hmac = createHmac('sha256', secretKey)
        .update(dataCheckString)
        .digest('hex');

      console.log('Verification details:', {
        dataCheckString,
        receivedHash: hash,
        generatedHash: hmac,
        params: Object.fromEntries(params.entries())
      });

      return hmac === hash;
    } catch (error) {
      console.error('Error in TelegramGuard:', error);
      return false;
    }
  }
} 