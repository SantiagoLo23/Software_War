export class CreateVictimDto {
  name: string;
  skills: string[];
  lastSeen?: string;
  transformationStatus: string;
  capturedBy: string;
}
