import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BotService {
  constructor(private configService: ConfigService) {}

  // Здесь будет логика бота
} 