import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as TelegramBot from 'node-telegram-bot-api';

@Injectable()
export class BotService implements OnModuleInit {
  private bot: TelegramBot;

  constructor(private configService: ConfigService) {
    const token = this.configService.get<string>('BOT_TOKEN');
    if (!token) {
      throw new Error('BOT_TOKEN not found in environment variables');
    }
    
    this.bot = new TelegramBot(token, { polling: true });
  }

  onModuleInit() {
    // Перенесем логику из старого бота
    this.bot.onText(/\/start/, (msg) => {
      const chatId = msg.chat.id;
      this.bot.sendMessage(chatId, 'Привет! Я тестовый бот. Что дальше?');
    });

    this.bot.on('message', (msg) => {
      const chatId = msg.chat.id;
      if (!msg.text?.startsWith('/')) {
        this.bot.sendMessage(chatId, `Вы написали: ${msg.text}`);
      }
    });

    console.log('Бот запущен...');
  }

  // Методы для отправки уведомлений
  async sendNotification(userId: number, message: string) {
    return this.bot.sendMessage(userId, message);
  }
} 