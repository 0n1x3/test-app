import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { validate } from '@tma.js/init-data-node';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TelegramGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const initData = request.body?.initData;
    
    try {
      const searchParams = new URLSearchParams(initData).toString();
      validate(
        this.configService.get('BOT_TOKEN'),
        searchParams
      );
      return true;
    } catch (e) {
      return false;
    }
  }
} 