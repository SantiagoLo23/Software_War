// src/controllers/reward.controller.ts
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
  Query,
  Patch
} from '@nestjs/common';
import { RewardService } from '../reward/reward.service';
import { CreateRewardDto, UpdateRewardDto } from '../reward/dto/create-reward.dto';
// import { JwtAuthGuard } from '../auth/jwt-auth.guard';
// import { RolesGuard } from '../auth/roles.guard';
// import { Roles } from '../auth/roles.decorator';

@Controller('rewards')
export class RewardController {
  constructor(private readonly rewardService: RewardService) {}

  // Endpoints públicos para ver el leaderboard
  
  @Get('leaderboard')
  async getLeaderboard() {
    return this.rewardService.generateLeaderboard();
  }

  // Endpoints para slaves
  
  @Get('my-rewards')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('slave')
  async getMyRewards(
    @Query('slaveId') slaveId?: string // Temporal para testing
    // @Request() req,
  ) {
    const actualSlaveId = slaveId || '507f1f77bcf86cd799439011';
    return this.rewardService.findRewardsByRecipient(actualSlaveId);
  }

  @Patch(':id/claim')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('slave')
  async claimReward(
    @Param('id') id: string,
    @Query('slaveId') slaveId?: string // Temporal para testing
    // @Request() req,
  ) {
    const actualSlaveId = slaveId || '507f1f77bcf86cd799439011';
    return this.rewardService.claimReward(id, actualSlaveId);
  }

  // Endpoints para Juan Sao Ville (administrador)
  
  @Get('admin/all')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('juan_sao_ville')
  async getAllRewards() {
    return this.rewardService.findAllRewards();
  }

  @Get('admin/stats')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('juan_sao_ville')
  async getRewardStats() {
    return this.rewardService.getRewardStats();
  }

  @Post('admin/create')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('juan_sao_ville')
  async createReward(
    @Body() createRewardDto: CreateRewardDto,
    @Query('adminId') adminId?: string // Temporal para testing
    // @Request() req,
  ) {
    // En producción, el adminId vendría de req.user.userId
    createRewardDto.awardedBy = adminId || 'juan_sao_ville_id';
    return this.rewardService.createReward(createRewardDto);
  }

  @Post('admin/auto-award-monthly')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('juan_sao_ville')
  async autoAwardMonthlyRewards() {
    return this.rewardService.autoAwardMonthlyRewards();
  }

  @Post('admin/special-reward')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('juan_sao_ville')
  async awardSpecialReward(
    @Body() specialRewardData: {
      recipientId: string;
      title: string;
      description: string;
      points?: number;
      badge?: string;
      notes?: string;
    },
    @Query('adminId') adminId?: string // Temporal para testing
    // @Request() req,
  ) {
    const actualAdminId = adminId || 'juan_sao_ville_id';
    return this.rewardService.awardSpecialReward(
      specialRewardData.recipientId,
      specialRewardData.title,
      specialRewardData.description,
      actualAdminId,
      {
        points: specialRewardData.points,
        badge: specialRewardData.badge,
        notes: specialRewardData.notes,
      }
    );
  }

  @Put('admin/:id')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('juan_sao_ville')
  async updateReward(
    @Param('id') id: string,
    @Body() updateRewardDto: UpdateRewardDto,
  ) {
    return this.rewardService.updateReward(id, updateRewardDto);
  }

  @Delete('admin/:id')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('juan_sao_ville')
  async deleteReward(@Param('id') id: string) {
    await this.rewardService.deleteReward(id);
    return { message: 'Reward deleted successfully' };
  }

  // Endpoints generales

  @Get(':id')
  async getRewardById(@Param('id') id: string) {
    return this.rewardService.findRewardById(id);
  }
}