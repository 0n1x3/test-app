import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { createHash, createHmac } from 'crypto';

@Injectable()
export class TelegramGuard implements CanActivate {
  private readonly BOT_TOKEN: string;

  constructor() {
    // Проверяем, что токен получен из переменных окружения
    if (!process.env.BOT_TOKEN) {
      console.error('Critical: BOT_TOKEN environment variable is not set');
      throw new Error('BOT_TOKEN environment variable is not set');
    }
    this.BOT_TOKEN = process.env.BOT_TOKEN;
  }

  canActivate(context: ExecutionContext): boolean {
    try {
      const request = context.switchToHttp().getRequest();
      const authHeader = request.headers.authorization;
      
      console.log('Auth header:', authHeader);
      console.log('BOT_TOKEN exists:', !!this.BOT_TOKEN);
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('No valid auth header');
        return false;
      }

      // Берем initData как есть, без декодирования
      const initData = authHeader.slice(7);
      
      // Создаем новый URLSearchParams из исходной строки
      const urlParams = new URLSearchParams(initData);
      const hash = urlParams.get('hash');
      
      if (!hash) {
        console.log('No hash in init data');
        return false;
      }
      
      console.log('Hash from init data:', hash);
      
      // Удаляем hash и signature из проверяемых данных
      urlParams.delete('hash');
      urlParams.delete('signature');
      
      // Получаем отсортированные пары ключ-значение
      // ВАЖНО: Не декодируем значения!
      const pairs = Array.from(urlParams.entries())
        .sort(([a], [b]) => a.localeCompare(b));
      
      // Создаем строку для проверки
      const dataCheckString = pairs
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');
      
      console.log('Data check string:', dataCheckString);
      
      // Проверяем наличие BOT_TOKEN
      if (!this.BOT_TOKEN) {
        console.error('BOT_TOKEN not found in environment');
        return false;
      }
      
      // Создаем секретный ключ
      const secretKey = createHash('sha256')
        .update(this.BOT_TOKEN)
        .digest();
      
      // Вычисляем HMAC
      const hmac = createHmac('sha256', secretKey)
        .update(dataCheckString)
        .digest('hex');
      
      console.log('Generated HMAC:', hmac);
      
      const isValid = hmac === hash;
      console.log('Hash comparison:', { received: hash, generated: hmac, isValid });
      
      return isValid;
    } catch (error) {
      console.error('Error in TelegramGuard:', error);
      return false;
    }
  }
} 