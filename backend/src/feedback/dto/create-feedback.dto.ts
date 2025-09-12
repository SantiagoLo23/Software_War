import {
  IsString,
  IsEnum,
  IsOptional,
  IsEmail,
  IsBoolean,
} from 'class-validator';
import { FeedbackType, FeedbackStatus } from '../schemas/feedback.schema';

export class CreateFeedbackDto {
  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsEnum(FeedbackType)
  @IsOptional()
  type?: FeedbackType;

  @IsString()
  @IsOptional()
  reporterName?: string;

  @IsEmail()
  @IsOptional()
  reporterEmail?: string;

  @IsString()
  @IsOptional()
  suspiciousSlaveActivity?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}

export class UpdateFeedbackDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  message?: string;

  @IsEnum(FeedbackType)
  @IsOptional()
  type?: FeedbackType;

  @IsEnum(FeedbackStatus)
  @IsOptional()
  status?: FeedbackStatus;

  @IsString()
  @IsOptional()
  adminResponse?: string;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}

export class VoteFeedbackDto {
  @IsString()
  @IsEnum(['upvote', 'downvote'])
  voteType: 'upvote' | 'downvote';
}
