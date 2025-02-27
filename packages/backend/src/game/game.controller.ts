import { Controller, Post, Body, Get, Query, Headers, Param, NotFoundException } from '@nestjs/common';
import { GameService } from './game.service';
import { GameType } from '@test-app/shared';
import { UsersService } from '../users/users.service';

@Controller('games')
export class GameController {
  constructor(
    private gameService: GameService,
    private usersService: UsersService
  ) {}

  @Get('list')
  async getGames(@Query('type') gameType: GameType) {
    const games = await this.gameService.getActiveGames(gameType);
    return { games };
  }

  @Post('create')
  async createGame(@Body() data: { 
    type: GameType; 
    betAmount: number;
    initData: string;
  }) {
    try {
      // Парсим данные пользователя из initData
      const params = new URLSearchParams(data.initData);
      const userStr = params.get('user');
      
      if (!userStr) {
        throw new Error('No user data found');
      }

      const userData = JSON.parse(decodeURIComponent(userStr));
      const user = await this.usersService.findByTelegramId(userData.id);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const game = await this.gameService.createGame(data.type, user, data.betAmount);

      return { 
        success: true,
        game,
        inviteLink: `https://t.me/neometria_bot?startapp=game_${game._id}`
      };
    } catch (error) {
      console.error('Error creating game:', error);
      throw error;
    }
  }

  @Post('join')
  async joinGame(@Body() data: { gameId: string; initData: string }) {
    try {
      console.log('Получен запрос на присоединение к игре:', data.gameId);
      
      // Парсим gameId из формата game_<id>
      const gameId = data.gameId.startsWith('game_') 
        ? data.gameId.substring(5) 
        : data.gameId;
      
      console.log('Обработанный ID игры:', gameId);
      
      // Парсим данные пользователя
      const params = new URLSearchParams(data.initData);
      const userStr = params.get('user');
      
      if (!userStr) {
        console.error('Данные пользователя не найдены в initData');
        throw new Error('No user data found');
      }

      const userData = JSON.parse(decodeURIComponent(userStr));
      console.log('Данные пользователя:', { id: userData.id, username: userData.username });
      
      const user = await this.usersService.findByTelegramId(userData.id);
      
      if (!user) {
        console.error(`Пользователь с ID ${userData.id} не найден`);
        throw new NotFoundException('User not found');
      }
      
      console.log(`Пользователь найден: ${user.username}, ID: ${user._id}`);

      // Присоединяем пользователя к игре
      const game = await this.gameService.joinGame(gameId, user);
      console.log('Пользователь успешно присоединился к игре');
      
      return { success: true, game };
    } catch (error) {
      console.error('Ошибка при присоединении к игре:', error);
      throw error;
    }
  }

  @Get('active')
  async getActiveGames(@Query('type') type: GameType) {
    try {
      const games = await this.gameService.getActiveGames(type);
      console.log('Active games:', games); // Для отладки
      return { success: true, games };
    } catch (error) {
      console.error('Error getting active games:', error);
      throw error;
    }
  }

  @Get(':id')
  async getGameById(@Param('id') id: string) {
    try {
      console.log(`Получен запрос на получение игры с ID: ${id}`);
      const game = await this.gameService.getGameById(id);
      
      if (!game) {
        throw new NotFoundException('Игра не найдена');
      }
      
      return { success: true, game };
    } catch (error) {
      console.error('Ошибка при получении игры:', error);
      throw error;
    }
  }
} 