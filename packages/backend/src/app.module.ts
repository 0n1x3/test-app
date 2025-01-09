import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { UsersModule } from './users/users.module';
import { BotModule } from './bot/bot.module';
import { GameModule } from './game/game.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/test-app'),
    UsersModule,
    BotModule,
    GameModule,
  ],
  controllers: [AppController],
})
export class AppModule {}