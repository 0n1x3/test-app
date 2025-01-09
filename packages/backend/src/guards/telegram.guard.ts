import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { createHash, createHmac } from 'crypto';

@Injectable()
export class TelegramGuard implements CanActivate {
  private readonly BOT_TOKEN = process.env.BOT_TOKEN;

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const { initData } = request.body;

    if (!initData) {
      return false;
    }

    return this.validateInitData(initData);
  }

  private validateInitData(initData: string): boolean {
    const urlParams = new URLSearchParams(initData);
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
  }
} 