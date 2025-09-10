// src/dto/reward.dto.ts
import { IsString, IsEnum, IsOptional, IsNumber, IsArray, IsObject, IsDateString } from 'class-validator';
import { RewardType, RewardStatus } from '../schemas/reward.schema';

export class CreateRewardDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsEnum(RewardType)
  type: RewardType;

  @IsString()
  recipientId: string;

  @IsString()
  awardedBy: string;

  @IsNumber()
  @IsOptional()
  points?: number;

  @IsString()
  @IsOptional()
  badge?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  specialPrivileges?: string[];

  @IsString()
  @IsOptional()
  period?: string;

  @IsObject()
  @IsOptional()
  achievementData?: {
    capturesCount?: number;
    transformationsCount?: number;
    streakDays?: number;
    specialMilestone?: string;
  };

  @IsDateString()
  @IsOptional()
  expiresAt?: Date;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateRewardDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(RewardStatus)
  @IsOptional()
  status?: RewardStatus;

  @IsNumber()
  @IsOptional()
  points?: number;

  @IsString()
  @IsOptional()
  badge?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  specialPrivileges?: string[];

  @IsDateString()
  @IsOptional()
  expiresAt?: Date;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class LeaderboardEntryDto {
  slaveId: string;
  slaveName: string;
  totalCaptures: number;
  transformedCount: number;
  currentStreak: number;
  totalPoints: number;
  badges: string[];
  rank: number;
  monthlyCaptures: number;
  lastActivity: Date;
}