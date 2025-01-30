import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { UserEntity } from './user.schema';

@Schema({ timestamps: true })
export class Tournament extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  prize: number;

  @Prop({ type: [{ type: Types.ObjectId, ref: UserEntity.name }] })
  participants: UserEntity[];

  @Prop({ default: 'pending' })
  status: 'pending' | 'active' | 'finished';
}

export const TournamentSchema = SchemaFactory.createForClass(Tournament);