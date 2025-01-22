import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum TransactionType {
  BET = 'bet',
  WIN = 'win',
  LOSS = 'loss',
  REWARD = 'reward'
}

export enum GameType {
  RPS = 'rps',
  DICE = 'dice'
}

@Schema({ timestamps: true })
export class Transaction extends Document {
  @Prop({ required: true })
  userId: number;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true, enum: TransactionType })
  type: TransactionType;

  @Prop({ required: true, enum: GameType })
  game: GameType;

  @Prop()
  gameId?: string;

  @Prop({ default: false })
  processed: boolean;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction); 