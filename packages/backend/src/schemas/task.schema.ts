import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Task extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  reward: number;

  @Prop({ required: true })
  type: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Map, of: Boolean, default: new Map() })
  completedBy: Map<string, boolean>;
}

export const TaskSchema = SchemaFactory.createForClass(Task); 