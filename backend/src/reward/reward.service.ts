// src/services/reward.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Reward, RewardDocument, RewardType, RewardStatus } from '../reward/schemas/reward.schema';
import { Victim, VictimDocument, TransformationStatus } from '../victims/schemas/victim.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { CreateRewardDto, UpdateRewardDto, LeaderboardEntryDto } from '../reward/dto/create-reward.dto';

@Injectable()
export class RewardService {
  constructor(
    @InjectModel(Reward.name) private rewardModel: Model<RewardDocument>,
    @InjectModel(Victim.name) private victimModel: Model<VictimDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async createReward(createRewardDto: CreateRewardDto): Promise<Reward> {
    const reward = new this.rewardModel({
      ...createRewardDto,
      awardedAt: new Date(),
      status: RewardStatus.AWARDED,
    });
    return reward.save();
  }

  async findAllRewards(): Promise<Reward[]> {
    return this.rewardModel
      .find()
      .sort({ awardedAt: -1 })
      .exec();
  }

  async findRewardsByRecipient(recipientId: string): Promise<Reward[]> {
    return this.rewardModel
      .find({ recipientId })
      .sort({ awardedAt: -1 })
      .exec();
  }

  async findRewardById(id: string): Promise<Reward> {
    const reward = await this.rewardModel.findById(id).exec();
    if (!reward) {
      throw new NotFoundException('Reward not found');
    }
    return reward;
  }

  async updateReward(id: string, updateRewardDto: UpdateRewardDto): Promise<Reward> {
    const updatedReward = await this.rewardModel
      .findByIdAndUpdate(id, updateRewardDto, { new: true })
      .exec();
    
    if (!updatedReward) {
      throw new NotFoundException('Reward not found');
    }
    
    return updatedReward;
  }

  async claimReward(id: string, slaveId: string): Promise<Reward> {
    const reward = await this.findRewardById(id);
    
    if (reward.recipientId !== slaveId) {
      throw new Error('You can only claim your own rewards');
    }
    
    if (reward.status !== RewardStatus.AWARDED) {
      throw new Error('Reward is not available for claiming');
    }

    reward.status = RewardStatus.CLAIMED;
    reward.claimedAt = new Date();
    
    return reward.save();
  }

  async deleteReward(id: string): Promise<void> {
    const result = await this.rewardModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Reward not found');
    }
  }

  async generateLeaderboard(): Promise<LeaderboardEntryDto[]> {
    const slaves = await this.userModel.find({ role: 'slave' }).exec();
    const leaderboard: LeaderboardEntryDto[] = [];

    for (const slave of slaves) {
      const victims = await this.victimModel.find({ capturedBy: slave._id.toString() }).exec();
      const rewards = await this.rewardModel.find({ recipientId: slave._id.toString() }).exec();
      
      const transformedCount = victims.filter(v => v.transformationStatus === TransformationStatus.TRANSFORMED).length;
      const totalPoints = rewards.reduce((sum, reward) => sum + (reward.points || 0), 0);
      const badges = rewards.map(reward => reward.badge).filter(Boolean);
      
      // Calcular capturas del mes actual
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyCaptures = victims.filter(v => {
        const captureDate = new Date(v.captureDate);
        return captureDate.getMonth() === currentMonth && captureDate.getFullYear() === currentYear;
      }).length;

      // Calcular racha actual (días consecutivos con actividad)
      const currentStreak = await this.calculateCurrentStreak(slave._id.toString());
      
      // Última actividad
      const lastActivity = victims.length > 0 
        ? new Date(Math.max(...victims.map(v => new Date(v.captureDate).getTime())))
        : slave.createdAt;

      leaderboard.push({
        slaveId: slave._id.toString(),
        slaveName: slave.username,
        totalCaptures: victims.length,
        transformedCount,
        currentStreak,
        totalPoints,
        badges,
        rank: 0, // Se asignará después del ordenamiento
        monthlyCaptures,
        lastActivity,
      });
    }

    // Ordenar por total de capturas transformadas, luego por capturas totales
    leaderboard.sort((a, b) => {
      if (b.transformedCount !== a.transformedCount) {
        return b.transformedCount - a.transformedCount;
      }
      return b.totalCaptures - a.totalCaptures;
    });

    // Asignar rankings
    leaderboard.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    return leaderboard;
  }

  async autoAwardMonthlyRewards(): Promise<Reward[]> {
    const leaderboard = await this.generateLeaderboard();
    const topSlaves = leaderboard.slice(0, 3); // Top 3
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const rewards: Reward[] = [];

    for (let i = 0; i < topSlaves.length; i++) {
      const slave = topSlaves[i];
      const positions = ['1st', '2nd', '3rd'];
      const points = [100, 50, 25];
      
      // Verificar que no haya recompensa ya otorgada este mes
      const existingReward = await this.rewardModel.findOne({
        recipientId: slave.slaveId,
        type: RewardType.MONTHLY_TOP_CAPTURER,
        period: currentMonth,
      }).exec();

      if (!existingReward) {
        const reward = await this.createReward({
          title: `${positions[i]} Place - Monthly Top Capturer`,
          description: `Awarded for being the ${positions[i]} most productive slave in ${currentMonth}`,
          type: RewardType.MONTHLY_TOP_CAPTURER,
          recipientId: slave.slaveId,
          awardedBy: 'system', // O el ID de Juan Sao Ville
          points: points[i],
          badge: `top_capturer_${i + 1}`,
          period: currentMonth,
          achievementData: {
            capturesCount: slave.totalCaptures,
            transformationsCount: slave.transformedCount,
          },
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
        });
        
        rewards.push(reward);
      }
    }

    return rewards;
  }

  async awardSpecialReward(
    recipientId: string, 
    title: string, 
    description: string,
    adminId: string,
    specialData?: any
  ): Promise<Reward> {
    return this.createReward({
      title,
      description,
      type: RewardType.SPECIAL_RECOGNITION,
      recipientId,
      awardedBy: adminId,
      points: specialData?.points || 10,
      badge: specialData?.badge,
      notes: specialData?.notes,
      achievementData: specialData?.achievementData,
    });
  }

  private async calculateCurrentStreak(slaveId: string): Promise<number> {
    const victims = await this.victimModel
      .find({ capturedBy: slaveId })
      .sort({ captureDate: -1 })
      .exec();

    if (victims.length === 0) return 0;

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const victim of victims) {
      const captureDate = new Date(victim.captureDate);
      captureDate.setHours(0, 0, 0, 0);

      const dayDiff = Math.floor((currentDate.getTime() - captureDate.getTime()) / (1000 * 60 * 60 * 24));

      if (dayDiff === streak) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (dayDiff > streak) {
        break;
      }
    }

    return streak;
  }

  async getRewardStats(): Promise<{
    totalRewards: number;
    byType: any;
    byStatus: any;
    recentRewards: Reward[];
    topPointEarners: any[];
  }> {
    const allRewards = await this.rewardModel.find().exec();
    
    const stats = {
      totalRewards: allRewards.length,
      byType: {
        monthlyTopCapturer: 0,
        weeklyAchievement: 0,
        specialRecognition: 0,
        transformationBonus: 0,
        streakReward: 0,
      },
      byStatus: {
        pending: 0,
        awarded: 0,
        claimed: 0,
        expired: 0,
      },
      recentRewards: [],
      topPointEarners: [] as Array<{
        userId: string;
        username: string;
        totalPoints: number;
      }>,
    };

    // Count by type and status
    allRewards.forEach(reward => {
      // Count by type
      switch (reward.type) {
        case RewardType.MONTHLY_TOP_CAPTURER:
          stats.byType.monthlyTopCapturer++;
          break;
        case RewardType.WEEKLY_ACHIEVEMENT:
          stats.byType.weeklyAchievement++;
          break;
        case RewardType.SPECIAL_RECOGNITION:
          stats.byType.specialRecognition++;
          break;
        case RewardType.TRANSFORMATION_BONUS:
          stats.byType.transformationBonus++;
          break;
        case RewardType.STREAK_REWARD:
          stats.byType.streakReward++;
          break;
      }

      // Count by status
      switch (reward.status) {
        case RewardStatus.PENDING:
          stats.byStatus.pending++;
          break;
        case RewardStatus.AWARDED:
          stats.byStatus.awarded++;
          break;
        case RewardStatus.CLAIMED:
          stats.byStatus.claimed++;
          break;
        case RewardStatus.EXPIRED:
          stats.byStatus.expired++;
          break;
      }
    });

    // Get recent rewards
    stats.recentRewards = await this.rewardModel
      .find()
      .sort({ awardedAt: -1 })
      .limit(10)
      .exec();

    // Calculate top point earners
    const pointsByUser = {};
    allRewards.forEach(reward => {
      if (pointsByUser[reward.recipientId]) {
        pointsByUser[reward.recipientId] += reward.points || 0;
      } else {
        pointsByUser[reward.recipientId] = reward.points || 0;
      }
    });

    const sortedPointEarners = Object.entries(pointsByUser)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 10);

    const users = await this.userModel.find({
      _id: { $in: sortedPointEarners.map(([id]) => id) }
    }).exec();

    stats.topPointEarners = sortedPointEarners.map(([userId, points]) => {
      const user = users.find(u => u._id.toString() === userId);
      return {
        userId,
        username: user?.username || 'Unknown',
        totalPoints: points,
      };
    });

    return stats;
  }
}