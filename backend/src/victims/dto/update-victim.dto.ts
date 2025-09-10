import { PartialType } from '@nestjs/mapped-types';
import { CreateVictimDto } from './create-victim.dto';

export class UpdateVictimDto extends PartialType(CreateVictimDto) {}
