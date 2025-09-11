import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles } from '../auth/roles';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      saltRounds,
    );

    const newUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
    });

    return newUser.save();
  }

  // Get all users (admin only)
  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  // Get user by ID
  async findById(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  // Update user by ID
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, {
        new: true,
      })
      .exec();

    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return updatedUser;
  }

  // Delete user by ID
  async remove(id: string): Promise<{ message: string }> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return { message: `User with ID ${id} deleted successfully` };
  }

  // Get top 10 slaves by captureCount
  async getLeaderboard(): Promise<User[]> {
    return this.userModel
      .find({ role: Roles.SLAVE }) 
      .sort({ captureCount: -1 })
      .limit(10)
      .exec();
  }

  // Find user by username

  async findByUsername(username: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ username }).exec();
  }

  async findVictims(): Promise<User[]> {
    return this.userModel.find({ role: Roles.DEVELOPER, isVictim: true }).exec();
  }

  async findAvailableDevelopers(): Promise<User[]> {
    return this.userModel
      .find({ role: Roles.DEVELOPER, isVictim: false })
      .exec();
  }

    async findAllDevelopers(): Promise<User[]> {
    return this.userModel
      .find({ role: Roles.DEVELOPER})
      .exec();
  }

}
