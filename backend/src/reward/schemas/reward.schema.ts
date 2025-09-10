// src/schemas/reward.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RewardDocument = Reward & Document;

export enum RewardType {
  MONTHLY_TOP_CAPTURER = 'monthly_top_capturer',
  WEEKLY_ACHIEVEMENT = 'weekly_achievement',
  SPECIAL_RECOGNITION = 'special_recognition',
  TRANSFORMATION_BONUS = 'transformation_bonus',
  STREAK_REWARD = 'streak_reward'
}

export enum RewardStatus {
  PENDING = 'pending',
  AWARDED = 'awarded',
  CLAIMED = 'claimed',
  EXPIRED = 'expired'
}

@Schema({ timestamps: true })
export class Reward {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ 
    enum: RewardType, 
    required: true 
  })
  type: RewardType;

  @Prop({ 
    enum: RewardStatus, 
    default: RewardStatus.PENDING 
  })
  status: RewardStatus;

  @Prop({ required: true })
  recipientId: string; // ID del slave que recibe la recompensa

  @Prop({ required: true })
  awardedBy: string; // ID de Juan Sao Ville

  @Prop()
  points?: number; // Puntos asignados

  @Prop()
  badge?: string; // Badge especial

  @Prop()
  specialPrivileges?: string[]; // Privilegios especiales

  @Prop()
  period?: string; // e.g., "2024-01", "Week 12-2024"

  @Prop()
  achievementData?: {
    capturesCount?: number;
    transformationsCount?: number;
    streakDays?: number;
    specialMilestone?: string;
  };

  @Prop()
  awardedAt?: Date;

  @Prop()
  claimedAt?: Date;

  @Prop()
  expiresAt?: Date;

  @Prop()
  notes?: string; // Notas adicionales de Juan Sao Ville
}

export const RewardSchema = SchemaFactory.createForClass(Reward);