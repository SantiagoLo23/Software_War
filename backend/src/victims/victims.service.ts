// src/services/victim.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Victim, VictimDocument, TransformationStatus } from '../victims/schemas/victim.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { CreateVictimDto, UpdateVictimDto, VictimStatsDto } from '../victims/dto/create-victim.dto';

@Injectable()
export class VictimService {
  constructor(
    @InjectModel(Victim.name) private victimModel: Model<VictimDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async createVictim(createVictimDto: CreateVictimDto): Promise<Victim> {
    const victim = new this.victimModel({
      ...createVictimDto,
      captureDate: new Date(),
    });
    return victim.save();
  }

  async findAllVictims(): Promise<Victim[]> {
    return this.victimModel.find().exec();
  }

  async findVictimsByCapture(slaveId: string): Promise<Victim[]> {
    return this.victimModel.find({ capturedBy: slaveId }).exec();
  }

  async findVictimById(id: string): Promise<Victim> {
    const victim = await this.victimModel.findById(id).exec();
    if (!victim) {
      throw new NotFoundException('Victim not found');
    }
    return victim;
  }

  async updateVictim(id: string, updateVictimDto: UpdateVictimDto, userId: string, userRole: string): Promise<Victim> {
    const victim = await this.findVictimById(id);
    
    // Solo Juan Sao Ville puede editar cualquier víctima, los slaves solo las suyas
    if (userRole !== 'juan_sao_ville' && victim.capturedBy !== userId) {
      throw new ForbiddenException('You can only edit victims you captured');
    }

    // Si el status cambia a 'transformed', agregar fecha de completion
    if (updateVictimDto.transformationStatus === TransformationStatus.TRANSFORMED && 
        victim.transformationStatus !== TransformationStatus.TRANSFORMED) {
      updateVictimDto['completionDate'] = new Date();
    }

    const updatedVictim = await this.victimModel
      .findByIdAndUpdate(id, updateVictimDto, { new: true })
      .exec();
    
    return updatedVictim;
  }

  async deleteVictim(id: string, userId: string, userRole: string): Promise<void> {
    const victim = await this.findVictimById(id);
    
    // Solo Juan Sao Ville puede eliminar cualquier víctima, los slaves solo las suyas
    if (userRole !== 'juan_sao_ville' && victim.capturedBy !== userId) {
      throw new ForbiddenException('You can only delete victims you captured');
    }

    await this.victimModel.findByIdAndDelete(id).exec();
  }

  async getGlobalStats(): Promise<VictimStatsDto> {
    const victims = await this.victimModel.find().exec();
    
    const stats: VictimStatsDto = {
      totalVictims: victims.length,
      byStatus: {
        captured: 0,
        inProgress: 0,
        transformed: 0,
        resisting: 0,
      },
      topCapturers: [],
    };

    // Contar por status
    victims.forEach(victim => {
      switch (victim.transformationStatus) {
        case TransformationStatus.CAPTURED:
          stats.byStatus.captured++;
          break;
        case TransformationStatus.IN_PROGRESS:
          stats.byStatus.inProgress++;
          break;
        case TransformationStatus.TRANSFORMED:
          stats.byStatus.transformed++;
          break;
        case TransformationStatus.RESISTING:
          stats.byStatus.resisting++;
          break;
      }
    });

    // Calcular top capturers
    const capturerCounts = {};
    victims.forEach(victim => {
      if (capturerCounts[victim.capturedBy]) {
        capturerCounts[victim.capturedBy]++;
      } else {
        capturerCounts[victim.capturedBy] = 1;
      }
    });

    // Obtener nombres de los slaves
    const slaveIds = Object.keys(capturerCounts);
    const slaves = await this.userModel.find({ 
      _id: { $in: slaveIds },
      role: 'slave' 
    }).exec();

    stats.topCapturers = slaves
      .map(slave => ({
        slaveName: slave.username,
        slaveId: slave._id.toString(),
        captureCount: capturerCounts[slave._id.toString()] || 0,
      }))
      .sort((a, b) => b.captureCount - a.captureCount)
      .slice(0, 10); // Top 10

    return stats;
  }

  async getSlaveStats(slaveId: string): Promise<{
    totalCaptures: number;
    byStatus: any;
    recentCaptures: Victim[];
    ranking: number;
  }> {
    const victims = await this.victimModel.find({ capturedBy: slaveId }).exec();
    
    const byStatus = {
      captured: 0,
      inProgress: 0,
      transformed: 0,
      resisting: 0,
    };

    victims.forEach(victim => {
      switch (victim.transformationStatus) {
        case TransformationStatus.CAPTURED:
          byStatus.captured++;
          break;
        case TransformationStatus.IN_PROGRESS:
          byStatus.inProgress++;
          break;
        case TransformationStatus.TRANSFORMED:
          byStatus.transformed++;
          break;
        case TransformationStatus.RESISTING:
          byStatus.resisting++;
          break;
      }
    });

    // Obtener capturas recientes (últimas 5)
    const recentCaptures = victims
      .sort((a, b) => new Date(b.captureDate).getTime() - new Date(a.captureDate).getTime())
      .slice(0, 5);

    // Calcular ranking
    const globalStats = await this.getGlobalStats();
    const currentSlaveStats = globalStats.topCapturers.find(capturer => capturer.slaveId === slaveId);
    const ranking = currentSlaveStats ? 
      globalStats.topCapturers.findIndex(capturer => capturer.slaveId === slaveId) + 1 : 
      globalStats.topCapturers.length + 1;

    return {
      totalCaptures: victims.length,
      byStatus,
      recentCaptures,
      ranking,
    };
  }
}