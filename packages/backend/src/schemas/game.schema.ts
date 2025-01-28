import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';
import { User } from './user.schema';

@Schema()
export class Lobby extends Document {
  @Prop({ index: true })
  status: string;
  
  @Prop({ index: true })
  gameType: string;
}

export const LobbySchema = SchemaFactory.createForClass(Lobby);

@Schema({ timestamps: true })
export class Game {
  @Prop({ required: true })
  type: 'dice' | 'rps';

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  players: User[];

  @Prop({ required: true })
  betAmount: number;

  @Prop({ 
    required: true,
    enum: ['waiting', 'playing', 'finished'],
    default: 'waiting'
  })
  status: string;

  @Prop()
  currentRound: number;

  @Prop()
  rounds: Array<{
    player1: number;
    player2: number;
    result: 'win' | 'lose' | 'draw';
  }>;
}

export const GameSchema = SchemaFactory.createForClass(Game); 