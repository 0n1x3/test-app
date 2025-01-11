import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { createHash, createHmac } from 'crypto';

@Injectable()
export class TelegramGuard implements CanActivate {
  private readonly BOT_TOKEN = process.env.BOT_TOKEN;

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const { initData } = request.body;

    if (!initData) {
      console.log('No initData in request');
      return false;
    }

    try {
      console.log('Validating initData:', initData);
      const isValid = this.validateInitData(initData);
      console.log('Validation result:', isValid);
      return isValid;
    } catch (error) {
      console.error('Validation error:', error);
      return false;
    }
  }

  private validateInitData(initData: string): boolean {
    try {
      // Декодируем URL-encoded строку
      const decodedData = decodeURIComponent(initData);
      const urlParams = new URLSearchParams(decodedData);
      const hash = urlParams.get('hash');
      urlParams.delete('hash');
      
      const dataCheckString = Array.from(urlParams.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');

      const secretKey = createHash('sha256')
        .update(this.BOT_TOKEN)
        .digest();
      
      const hmac = createHmac('sha256', secretKey)
        .update(dataCheckString)
        .digest('hex');

      return hmac === hash;
    } catch (error) {
      console.error('Error validating data:', error);
      return false;
    }
  }
} 