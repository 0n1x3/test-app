import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Task extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  reward: number;

  @Prop({ type: Map, of: Boolean, default: new Map() })
  completedBy: Map<string, boolean>;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 1 })
  requiredLevel: number;
}

export const TaskSchema = SchemaFactory.createForClass(Task); 