// src/controllers/victim.controller.ts
import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  UseGuards,
  Request,
  Query 
} from '@nestjs/common';
import { VictimService } from '../victims/victims.service';
import { CreateVictimDto, UpdateVictimDto } from '../victims/dto/create-victim.dto';
// import { JwtAuthGuard } from '../auth/jwt-auth.guard';
// import { RolesGuard } from '../auth/roles.guard';
// import { Roles } from '../auth/roles.decorator';

@Controller('victims')
export class VictimController {
  constructor(private readonly victimService: VictimService) {}

  // Por ahora sin guards hasta que se arregle el problema de autenticación
  
  @Post()
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('slave', 'juan')
  async createVictim(
    @Body() createVictimDto: CreateVictimDto,
    // @Request() req,
  ) {
    // Temporalmente hardcodeamos un slaveId para testing
    // En producción esto vendría de req.user.userId
    createVictimDto.capturedBy = createVictimDto.capturedBy || '507f1f77bcf86cd799439011';
    
    return this.victimService.createVictim(createVictimDto);
  }

  @Get()
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('juan')
  async getAllVictims() {
    return this.victimService.findAllVictims();
  }

  @Get('stats')
  // @UseGuards(JwtAuthGuard)
  async getGlobalStats() {
    return this.victimService.getGlobalStats();
  }

  @Get('my-captures')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('slave')
  async getMyCaptures(
    @Query('slaveId') slaveId?: string // Temporal para testing
    // @Request() req,
  ) {
    // Temporalmente usamos query param, en producción sería req.user.userId
    const actualSlaveId = slaveId || '507f1f77bcf86cd799439011';
    return this.victimService.findVictimsByCapture(actualSlaveId);
  }

  @Get('my-stats')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('slave')
  async getMyStats(
    @Query('slaveId') slaveId?: string // Temporal para testing
    // @Request() req,
  ) {
    const actualSlaveId = slaveId || '507f1f77bcf86cd799439011';
    return this.victimService.getSlaveStats(actualSlaveId);
  }

  @Get(':id')
  // @UseGuards(JwtAuthGuard)
  async getVictimById(@Param('id') id: string) {
    return this.victimService.findVictimById(id);
  }

  @Put(':id')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('slave', 'juan')
  async updateVictim(
    @Param('id') id: string,
    @Body() updateVictimDto: UpdateVictimDto,
    @Query('userId') userId?: string, // Temporal para testing
    @Query('userRole') userRole?: string, // Temporal para testing
    // @Request() req,
  ) {
    // Valores temporales para testing
    const actualUserId = userId || '507f1f77bcf86cd799439011';
    const actualUserRole = userRole || 'slave';
    
    return this.victimService.updateVictim(id, updateVictimDto, actualUserId, actualUserRole);
  }

  @Delete(':id')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('slave', 'juan')
  async deleteVictim(
    @Param('id') id: string,
    @Query('userId') userId?: string, // Temporal para testing
    @Query('userRole') userRole?: string, // Temporal para testing
    // @Request() req,
  ) {
    const actualUserId = userId || '507f1f77bcf86cd799439011';
    const actualUserRole = userRole || 'slave';
    
    await this.victimService.deleteVictim(id, actualUserId, actualUserRole);
    return { message: 'Victim deleted successfully' };
  }

  // Endpoints especiales para cada rol

  @Get('slave/:slaveId/victims')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('juan')
  async getVictimsBySlave(@Param('slaveId') slaveId: string) {
    return this.victimService.findVictimsByCapture(slaveId);
  }

  @Get('slave/:slaveId/stats')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('juan')
  async getSlaveStats(@Param('slaveId') slaveId: string) {
    return this.victimService.getSlaveStats(slaveId);
  }
}