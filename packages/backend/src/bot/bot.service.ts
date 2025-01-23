import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as TelegramBot from 'node-telegram-bot-api';

@Injectable()
export class BotService implements OnModuleInit {
  private bot: TelegramBot;

  constructor(private configService: ConfigService) {
    const token = this.configService.get<string>('BOT_TOKEN');
    console.log('Bot token first 10 chars:', token?.substring(0, 10));
    
    // Проверяем токен через Telegram API
    this.bot = new TelegramBot(token, { polling: true });
    this.bot.getMe().then(
      info => console.log('Bot info:', info),
      err => console.error('Invalid bot token:', err)
    );
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