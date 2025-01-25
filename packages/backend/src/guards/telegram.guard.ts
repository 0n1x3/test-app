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
      
      // Получаем хеш из исходной строки
      const searchParams = new URLSearchParams(initData);
      const hash = searchParams.get('hash');
      if (!hash) return false;

      // Важно: работаем с исходной строкой, а не с декодированными значениями
      const checkString = initData
        .split('&')
        .filter(param => !param.startsWith('hash=') && !param.startsWith('signature='))
        .sort()
        .join('\n');

      const secretKey = createHash('sha256')
        .update(this.BOT_TOKEN)
        .digest();

      const hmac = createHmac('sha256', secretKey)
        .update(checkString)
        .digest('hex');

      console.log('Verification details:', {
        checkString,
        receivedHash: hash,
        generatedHash: hmac
      });

      return hmac === hash;
    } catch (error) {
      console.error('Error in TelegramGuard:', error);
      return false;
    }
  }
} 