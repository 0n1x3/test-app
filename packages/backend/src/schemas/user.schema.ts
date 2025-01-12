import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Task } from './task.schema';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true })
  telegramId: number;

  @Prop({ required: true })
  username: string;

  @Prop()
  avatarUrl: string;

  @Prop({ default: 0 })
  balance: number;

  @Prop({ default: 1 })
  level: number;

  @Prop({ default: 0 })
  experience: number;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Task' }] })
  completedTasks: Task[];

  @Prop({ default: false })
  isActive: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);