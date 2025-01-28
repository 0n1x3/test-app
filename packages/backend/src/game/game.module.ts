import { Module } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { TransactionsModule } from '../transactions/transactions.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Game, GameSchema } from '../schemas/game.schema';
import { UserSchema } from '../schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Game.name, schema: GameSchema },
      { name: 'User', schema: UserSchema }
    ]),
    TransactionsModule
  ],
  controllers: [GameController],
  providers: [GameGateway, GameService],
  exports: [GameService],
})
export class GameModule {} 