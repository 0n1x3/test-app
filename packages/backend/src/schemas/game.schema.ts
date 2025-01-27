import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Lobby extends Document {
  @Prop({ index: true })
  status: string;
  
  @Prop({ index: true })
  gameType: string;
}

export const LobbySchema = SchemaFactory.createForClass(Lobby); 