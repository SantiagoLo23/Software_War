import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';        // ✅ Solo JWT
import { RolesGuard } from '../auth/guards/roles.guard';      // ✅ JWT + Roles
import { RolesDecorator } from '../auth/decorators/roles.decorator';
import { Roles } from '../auth/roles';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('signup')
  async signup(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // ✅ Endpoint que solo necesita autenticación JWT
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return { message: 'User profile', user: req.user };
  }

  // ✅ Endpoint que necesita autenticación JWT + verificación de rol
  @UseGuards(RolesGuard)
  @RolesDecorator(Roles.JUAN)
  @Get('protected')
  getProtectedData(@Request() req) {
    console.log('🔧 Endpoint protegido ejecutado');
    return { message: 'Access granted to Juan', user: req.user };
  }
}