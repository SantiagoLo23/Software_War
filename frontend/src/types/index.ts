export enum UserRole {
  JUAN = "juan",
  SLAVE = "slave",
  DEVELOPER = "developer",
}

export interface User {
  _id: string;
  username: string;
  role: UserRole;
  captureCount: number;
  isVictim: boolean;
  reward?: string;
}

export interface LoginResponse {
  access_token: string;
}

export interface Victim {
  _id: string;
  skills: string[];
  lastSeen: string;
  transformationStatus: string;
  capturedBy: string;
  developerId: string;
}

export enum FeedbackType {
  SLAVE_ACTIVITY_REPORT = "slave_activity_report",
  SURVIVAL_STORY = "survival_story",
  RESISTANCE_TIP = "resistance_tip",
}

export interface Feedback {
  _id: string;
  title: string;
  message: string;
  type: FeedbackType;
  reporterName?: string;
  reporterEmail?: string;
  suspiciousSlaveActivity?: string;
  location?: string;
  upvotes: number;
  downvotes: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateVictimDto {
  skills: string[];
  lastSeen?: string;
  transformationStatus: string;
  developerId: string;
}

export interface CreateFeedbackDto {
  title: string;
  message: string;
  type?: FeedbackType;
  reporterName?: string;
  reporterEmail?: string;
  suspiciousSlaveActivity?: string;
  location?: string;
}
