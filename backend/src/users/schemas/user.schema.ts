import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

export enum UserRole {
  JUAN = 'juan',
  SLAVE = 'slave',
  DEVELOPER = 'developer',
}

@Schema()
export class User {
  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, enum: UserRole })
  role: UserRole;

  @Prop({ default: 0 })
  captureCount: number;

  @Prop({ default: false })
  isVictim: boolean;

  @Prop({ default: null })
  reward?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
