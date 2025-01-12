import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { TasksService } from './tasks.service';

@Controller('tasks')
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Get('active')
  async getActiveTasks(@Body() { telegramId }: { telegramId: number }) {
    return this.tasksService.getActiveTasks(telegramId);
  }

  @Get('completed')
  async getCompletedTasks(@Body() { telegramId }: { telegramId: number }) {
    return this.tasksService.getCompletedTasks(telegramId);
  }

  @Post('complete')
  async completeTask(@Body() { telegramId, taskId }: { telegramId: number; taskId: string }) {
    return this.tasksService.completeTask(telegramId, taskId);
  }
} 