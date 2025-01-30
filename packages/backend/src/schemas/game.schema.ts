import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Lobby extends Document {
  @Prop({ index: true })
  status: string;
  
  @Prop({ index: true })
  gameType: string;
}

export const LobbySchema = SchemaFactory.createForClass(Lobby);

@Schema({ timestamps: true })
export class Game extends Document {
  @Prop({ 
    required: true,
    default: function(this: Game) {
      return `Game #${this._id}`;
    }
  })
  name: string;

  @Prop({ 
    type: String, 
    enum: ['rps', 'dice'],
    required: true 
  })
  type: string;

  @Prop([{ 
    type: Types.ObjectId, 
    ref: 'User' 
  }])
  players: Types.ObjectId[];

  @Prop({ required: true })
  betAmount: number;

  @Prop({ 
    type: String, 
    enum: ['waiting', 'playing', 'finished'],
    default: 'waiting'
  })
  status: string;

  @Prop()
  currentRound: number;

  @Prop()
  rounds?: Array<{
    player1: number;
    player2: number;
    result: 'win' | 'lose' | 'draw';
  }>;
}

export const GameSchema = SchemaFactory.createForClass(Game); 