import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  UseGuards,
} from '@nestjs/common';
import { VictimsService } from './victims.service';
import { CreateVictimDto } from './dto/create-victim.dto';
import { UpdateVictimDto } from './dto/update-victim.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RolesDecorator } from '../auth/decorators/roles.decorator';
import { Roles } from '../auth/roles';

@Controller('victims')
export class VictimsController {
  constructor(private readonly victimsService: VictimsService) {}

  /**
   * POST /victims/create
   * Body: {
   *   skills: string[],
   *   lastSeen?: string,
   *   transformationStatus: string,
   *   developerId: string
   * }
   * Automatically sets capturedBy from JWT
   * Roles: Juan, Slave
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RolesDecorator(Roles.JUAN, Roles.SLAVE)
  @Post('create')
  async create(@Body() createVictimDto: CreateVictimDto, @Request() req) {
    const captorId = req.user._id;
    return this.victimsService.create(createVictimDto, captorId);
  }

  // Get all victims (Juan and Slave)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RolesDecorator(Roles.JUAN, Roles.SLAVE)
  @Get()
  async findAll() {
    return this.victimsService.findAll();
  }

  // Get victim by ID (Juan and Slave)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RolesDecorator(Roles.JUAN, Roles.SLAVE)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.victimsService.findById(id);
  }

  // Update victim by ID (Juan and Slave)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RolesDecorator(Roles.JUAN, Roles.SLAVE)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateVictimDto: UpdateVictimDto,
    @Request() req,
  ) {
    return this.victimsService.update(id, updateVictimDto, req.user);
  }

  // Delete victim by ID (Juan only)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RolesDecorator(Roles.JUAN)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.victimsService.remove(id);
  }
}
