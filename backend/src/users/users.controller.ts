import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RolesDecorator } from '../auth/decorators/roles.decorator';
import { Roles } from '../auth/roles';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Public signup route (available to everyone)
  @Post('signup')
  async signup(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // Get all users (admin only)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RolesDecorator(Roles.JUAN)
  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  // Get own profile (juan and slave)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RolesDecorator(Roles.JUAN, Roles.SLAVE)
  @Get('me')
  async getProfile(@Request() req) {
    return this.usersService.findById(req.user._id);
  }

  // Get leaderboard (juan only)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RolesDecorator(Roles.JUAN)
  @Get('leaderboard')
  async getLeaderboard() {
    return this.usersService.getLeaderboard();
  }

  // Get all victims (juan and slave)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RolesDecorator(Roles.JUAN, Roles.SLAVE)
  @Get('victims')
  getVictims() {
    return this.usersService.findVictims();
  }

  // Get all developers (juan and slave)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RolesDecorator(Roles.JUAN, Roles.SLAVE)
  @Get('developers')
  getAllDevelopers() {
    return this.usersService.findAllDevelopers();
  }

  // Get available developers (juan and slave)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RolesDecorator(Roles.JUAN, Roles.SLAVE)
  @Get('available')
  getAvailableDevelopers() {
    return this.usersService.findAvailableDevelopers();
  }

  // Get user by ID (juan only)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RolesDecorator(Roles.JUAN)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  // Update user by ID (juan only)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RolesDecorator(Roles.JUAN)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  // Delete user by ID (juan only)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RolesDecorator(Roles.JUAN)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @RolesDecorator(Roles.JUAN)
  @Patch(':id/reward')
  async assignReward(
    @Param('id') id: string,
    @Body() body: { reward: string },
  ) {
    return this.usersService.update(id, { reward: body.reward });
  }
}
