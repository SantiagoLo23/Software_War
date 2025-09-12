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

  private sanitizeUser(user: UserDocument): Partial<User> {
    const { password, ...rest } = user.toObject();
    return rest;
  }

  async create(createUserDto: CreateUserDto): Promise<Partial<User>> {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      saltRounds,
    );
    const newUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();
    return this.sanitizeUser(savedUser);
  }

  async findAll(): Promise<Partial<User>[]> {
    const users = await this.userModel.find().exec();
    return users.map((user) => this.sanitizeUser(user));
  }

  async findById(id: string): Promise<Partial<User>> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return this.sanitizeUser(user);
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<Partial<User>> {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .exec();

    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.sanitizeUser(updatedUser);
  }

  async remove(id: string): Promise<{ message: string }> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return { message: `User with ID ${id} deleted successfully` };
  }

  async getLeaderboard(): Promise<Partial<User>[]> {
    const slaves = await this.userModel
      .find({ role: Roles.SLAVE })
      .sort({ captureCount: -1 })
      .limit(10)
      .exec();

    return slaves.map((user) => this.sanitizeUser(user));
  }

  async findByUsername(username: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ username }).exec();
  }

  async findVictims(): Promise<Partial<User>[]> {
    const victims = await this.userModel
      .find({ role: Roles.DEVELOPER, isVictim: true })
      .exec();

    return victims.map((user) => this.sanitizeUser(user));
  }

  async findAvailableDevelopers(): Promise<Partial<User>[]> {
    const available = await this.userModel
      .find({ role: Roles.DEVELOPER, isVictim: false })
      .exec();

    return available.map((user) => this.sanitizeUser(user));
  }

  async findAllDevelopers(): Promise<Partial<User>[]> {
    const developers = await this.userModel
      .find({ role: Roles.DEVELOPER })
      .exec();
    return developers.map((user) => this.sanitizeUser(user));
  }
}
