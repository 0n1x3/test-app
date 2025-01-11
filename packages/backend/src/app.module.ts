import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { UsersModule } from './users/users.module';
import { BotModule } from './bot/bot.module';
import { GameModule } from './game/game.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb+srv://username:password@neometria.lpi4d.mongodb.net/test-app?retryWrites=true&w=majority'),
    UsersModule,
    BotModule,
    GameModule,
  ],
  controllers: [AppController],
})
export class AppModule {}