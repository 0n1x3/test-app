import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TasksService } from './tasks/tasks.service';

async function bootstrap() {
  try {
    // Логируем переменные окружения (только ключи)
    console.log('Environment variables:', {
      keys: Object.keys(process.env),
      bot_token_length: process.env.BOT_TOKEN?.length
    });

    const app = await NestFactory.create(AppModule);
    
    app.enableCors({
      origin: ['https://test.timecommunity.xyz', 'http://localhost:3000'],
      methods: ['GET', 'POST'],
      credentials: true,
    });

    app.setGlobalPrefix('api');

    // Инициализируем первое задание
    const tasksService = app.get(TasksService);
    await tasksService.initDefaultTasks();

    await app.listen(3005);
    console.log('Application started on port 3005');
  } catch (error) {
    console.error('Failed to start application:', error);
    process.exit(1);
  }
}

bootstrap(); 