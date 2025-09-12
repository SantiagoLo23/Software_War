import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Victim, VictimDocument } from './schemas/victim.schema';
import { CreateVictimDto } from './dto/create-victim.dto';
import { UpdateVictimDto } from './dto/update-victim.dto';
import { User } from 'src/users/schemas/user.schema';

@Injectable()
export class VictimsService {
  constructor(
    @InjectModel(Victim.name) private victimModel: Model<VictimDocument>,
    @InjectModel(User.name) private userModel: Model<any>,
  ) {}

  async create(
    createVictimDto: CreateVictimDto,
    captorId: string,
  ): Promise<Victim> {
    // 1. Validate developer
    const developer = await this.userModel.findById(
      createVictimDto.developerId,
    );
    if (!developer || developer.role !== 'developer') {
      throw new NotFoundException('Developer not found or invalid role');
    }
    if (developer.isVictim) {
      throw new Error('Developer is already marked as a victim');
    }

    // 2. Mark developer as victim
    await this.userModel.findByIdAndUpdate(
      createVictimDto.developerId,
      { isVictim: true },
      { new: true },
    );

    // 3. Increment captor's capture count
    await this.userModel.findByIdAndUpdate(
      captorId,
      { $inc: { captureCount: 1 } },
      { new: true },
    );

    // 4. Create victim record
    const newVictim = new this.victimModel({
      ...createVictimDto,
      capturedBy: captorId,
    });

    return newVictim.save();
  }

  async findAll(): Promise<Victim[]> {
    return this.victimModel.find().exec();
  }

  async findById(id: string): Promise<Victim> {
    const victim = await this.victimModel.findById(id).exec();
    if (!victim) {
      throw new NotFoundException(`Victim with ID ${id} not found`);
    }
    return victim;
  }

  async update(id: string, updateVictimDto: UpdateVictimDto): Promise<Victim> {
    const updatedVictim = await this.victimModel
      .findByIdAndUpdate(id, updateVictimDto, {
        new: true,
      })
      .exec();

    if (!updatedVictim) {
      throw new NotFoundException(`Victim with ID ${id} not found`);
    }

    return updatedVictim;
  }

  async remove(id: string): Promise<{ message: string }> {
    const result = await this.victimModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Victim with ID ${id} not found`);
    }
    return { message: `Victim with ID ${id} deleted successfully` };
  }
}
