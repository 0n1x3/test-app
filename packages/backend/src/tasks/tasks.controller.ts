import { Controller, Get, Post, Body, UseGuards, Query } from '@nestjs/common';
import { TasksService } from './tasks.service';

@Controller('tasks')
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Post('active')
  async getActiveTasks(@Body() data: any) {
    try {
      // Парсим данные пользователя из URL-encoded строки
      const params = new URLSearchParams(data.initData);
      const userStr = params.get('user');
      
      if (!userStr) {
        throw new Error('No user data found');
      }

      const user = JSON.parse(decodeURIComponent(userStr));
      console.log('Getting active tasks for user:', user.id);
      
      const tasks = await this.tasksService.getActiveTasks(user.id);
      console.log('Active tasks:', tasks);
      
      return tasks;
    } catch (error) {
      console.error('Error getting active tasks:', error);
      throw error;
    }
  }

  @Get('completed')
  async getCompletedTasks(@Query('initData') initData: string) {
    try {
      const params = new URLSearchParams(initData);
      const userStr = params.get('user');
      
      if (!userStr) {
        throw new Error('No user data found');
      }

      const user = JSON.parse(decodeURIComponent(userStr));
      return this.tasksService.getCompletedTasks(user.id);
    } catch (error) {
      console.error('Error getting completed tasks:', error);
      throw error;
    }
  }

  @Post('complete')
  async completeTask(@Body() { telegramId, taskId }: { telegramId: number; taskId: string }) {
    return this.tasksService.completeTask(telegramId, taskId);
  }
} 