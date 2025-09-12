import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from '../users/dto/login.dto';

/**
 * POST /auth/login
 * Body: { username: string, password: string }
 * Returns: { access_token: string }
 * Roles: Juan, Slave, Developer
 */
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(
      loginDto.username,
      loginDto.password,
    );

    if (!user) {
      console.warn(`Login failed for username: ${loginDto.username}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.authService.login(user);
  }
}
