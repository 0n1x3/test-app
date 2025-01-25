import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class TelegramGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    // Временно пропускаем все запросы
    return true;
  }
} 