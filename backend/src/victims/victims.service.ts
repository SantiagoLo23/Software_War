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

  async create(createVictimDto: CreateVictimDto): Promise<Victim> {
    const newVictim = new this.victimModel(createVictimDto);
    const savedVictim = await newVictim.save();

    // Incrementar contador del esclavo
    await this.userModel.findByIdAndUpdate(
      createVictimDto.capturedBy,
      { $inc: { captureCount: 1 } },
      { new: true },
    );

    return savedVictim;
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
