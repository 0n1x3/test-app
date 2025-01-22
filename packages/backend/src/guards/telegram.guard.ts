import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { createHash, createHmac } from 'crypto';

@Injectable()
export class TelegramGuard implements CanActivate {
  private readonly BOT_TOKEN = process.env.BOT_TOKEN;

  canActivate(context: ExecutionContext): boolean {
    try {
      const request = context.switchToHttp().getRequest();
      const authHeader = request.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return false;
      }

      const initData = authHeader.slice(7); // Убираем 'Bearer '
      
      // Проверяем данные
      const urlParams = new URLSearchParams(initData);
      const hash = urlParams.get('hash');
      if (!hash) return false;
      
      // Удаляем hash из проверяемых данных
      urlParams.delete('hash');
      
      // Сортируем оставшиеся параметры
      const dataCheckString = Array.from(urlParams.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');
      
      // Создаем секретный ключ
      const secretKey = createHash('sha256')
        .update(this.BOT_TOKEN)
        .digest();
      
      // Вычисляем HMAC
      const hmac = createHmac('sha256', secretKey)
        .update(dataCheckString)
        .digest('hex');
      
      return hmac === hash;
    } catch (error) {
      console.error('Error validating Telegram data:', error);
      return false;
    }
  }
} 