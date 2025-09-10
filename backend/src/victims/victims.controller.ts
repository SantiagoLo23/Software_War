import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { VictimsService } from './victims.service';
import { CreateVictimDto } from './dto/create-victim.dto';
import { UpdateVictimDto } from './dto/update-victim.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('victims')
@UseGuards(JwtAuthGuard)
export class VictimsController {
  constructor(private readonly victimsService: VictimsService) {}

  @Post()
  async create(@Body() createVictimDto: CreateVictimDto) {
    return this.victimsService.create(createVictimDto);
  }

  @Get()
  async findAll() {
    return this.victimsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.victimsService.findById(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateVictimDto: UpdateVictimDto,
  ) {
    return this.victimsService.update(id, updateVictimDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.victimsService.remove(id);
  }
}
