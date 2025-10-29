import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FeedbackDocument = Feedback & Document;

export enum FeedbackType {
  SLAVE_ACTIVITY_REPORT = 'slave_activity_report',
  SURVIVAL_STORY = 'survival_story',
  RESISTANCE_TIP = 'resistance_tip',
}

@Schema({ timestamps: true })
export class Feedback {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  message: string;

  @Prop({
    enum: FeedbackType,
    default: FeedbackType.RESISTANCE_TIP,
  })
  type: FeedbackType;

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

  @Prop({ type: [String], default: [] })
  upvoters: string[];

  @Prop({ type: [String], default: [] })
  downvoters: string[];
}

export const FeedbackSchema = SchemaFactory.createForClass(Feedback);
