// src/dto/victim.dto.ts
import { IsString, IsArray, IsEnum, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { TransformationStatus } from '../schemas/victim.schema';

export class CreateVictimDto {
  @IsString()
  name: string;

  @IsString()
  originalRole: string;

  @IsArray()
  @IsString({ each: true })
  skills: string[];

  @IsString()
  lastSeen: string;

  @IsEnum(TransformationStatus)
  @IsOptional()
  transformationStatus?: TransformationStatus;

  @IsString()
  @IsOptional()
  transformationNotes?: string;

  @IsString()
  capturedBy: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  resistanceLevel?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  currentDataScienceSkills?: string[];
}

export class UpdateVictimDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  originalRole?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  skills?: string[];

  @IsString()
  @IsOptional()
  lastSeen?: string;

  @IsEnum(TransformationStatus)
  @IsOptional()
  transformationStatus?: TransformationStatus;

  @IsString()
  @IsOptional()
  transformationNotes?: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  resistanceLevel?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  currentDataScienceSkills?: string[];
}

export class VictimStatsDto {
  totalVictims: number;
  byStatus: {
    captured: number;
    inProgress: number;
    transformed: number;
    resisting: number;
  };
  topCapturers: {
    slaveName: string;
    slaveId: string;
    captureCount: number;
  }[];
}