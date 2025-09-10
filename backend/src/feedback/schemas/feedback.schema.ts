// src/schemas/feedback.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FeedbackDocument = Feedback & Document;

export enum FeedbackType {
  SLAVE_ACTIVITY_REPORT = 'slave_activity_report',
  SURVIVAL_STORY = 'survival_story',
  RESISTANCE_TIP = 'resistance_tip',
  BUG_REPORT = 'bug_report',
  GENERAL_FEEDBACK = 'general_feedback'
}

export enum FeedbackStatus {
  PENDING = 'pending',
  REVIEWED = 'reviewed',
  RESOLVED = 'resolved',
  DISMISSED = 'dismissed'
}

@Schema({ timestamps: true })
export class Feedback {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  message: string;

  @Prop({ 
    enum: FeedbackType, 
    default: FeedbackType.GENERAL_FEEDBACK 
  })
  type: FeedbackType;

  @Prop({ 
    enum: FeedbackStatus, 
    default: FeedbackStatus.PENDING 
  })
  status: FeedbackStatus;

  @Prop()
  reporterName?: string; // Optional, can be anonymous

  @Prop()
  reporterEmail?: string; // Optional

  @Prop()
  suspiciousSlaveActivity?: string; // For slave activity reports

  @Prop()
  location?: string; // Where the incident occurred

  @Prop({ default: 0 })
  upvotes: number; // Community can upvote useful tips/stories

  @Prop({ default: 0 })
  downvotes: number;

  @Prop()
  adminResponse?: string; // Response from Juan Sao Ville

  @Prop()
  reviewedBy?: string; // Admin who reviewed it

  @Prop()
  reviewedAt?: Date;

  @Prop({ default: true })
  isPublic: boolean; // Whether to show in public resistance page
}

export const FeedbackSchema = SchemaFactory.createForClass(Feedback);