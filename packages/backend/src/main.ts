import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TasksService } from './tasks/tasks.service';

async function bootstrap() {
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
}
bootstrap(); 