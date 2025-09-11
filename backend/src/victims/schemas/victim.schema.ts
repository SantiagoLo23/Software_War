import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type VictimDocument = Victim & Document;

@Schema()
export class Victim {
  @Prop({ type: [String], default: [] })
  skills: string[];

  @Prop()
  lastSeen: string;

  @Prop({ required: true })
  transformationStatus: string;

  @Prop({ required: true })
  capturedBy: string;

  @Prop({ required: true })
  developerId: string;
}

export const VictimSchema = SchemaFactory.createForClass(Victim);
