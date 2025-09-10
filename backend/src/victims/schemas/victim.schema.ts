import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type VictimDocument = Victim & Document;

export enum TransformationStatus {
  CAPTURED = 'captured',
  IN_PROGRESS = 'in_progress',
  TRANSFORMED = 'transformed',
  RESISTING = 'resisting'
}

@Schema({ timestamps: true })
export class Victim {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  originalRole: string; // Frontend, Backend, Fullstack, Mobile, etc.

  @Prop([String])
  skills: string[]; // JavaScript, React, Node.js, etc.

  @Prop({ required: true })
  lastSeen: string; // Location or event where they were captured

  @Prop({ 
    enum: TransformationStatus, 
    default: TransformationStatus.CAPTURED 
  })
  transformationStatus: TransformationStatus;

  @Prop()
  transformationNotes?: string; // Progress notes

  @Prop({ required: true })
  capturedBy: string; // ID del slave que lo capturó

  @Prop({ default: Date.now })
  captureDate: Date;

  @Prop()
  completionDate?: Date; // When transformation is complete

  @Prop({ default: 0 })
  resistanceLevel: number; // 0-100, how much they're fighting back

  @Prop()
  currentDataScienceSkills?: string[]; // Skills acquired during transformation
}

export const VictimSchema = SchemaFactory.createForClass(Victim);