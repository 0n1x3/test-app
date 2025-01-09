import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

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

  @Prop()
  tonWallet: string;

  @Prop({ default: false })
  isActive: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);