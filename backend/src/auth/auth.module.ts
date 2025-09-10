import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersModule } from '../users/users.module';
import { JwtAuthGuard } from './guards/jwt-auth.guard';        // ✅ Solo JWT
import { RolesGuard } from './guards/roles.guard';      // ✅ JWT + Roles combinado

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default_secret',
      signOptions: { expiresIn: '1h' },
    }),
    forwardRef(() => UsersModule),
  ],
  providers: [AuthService, JwtStrategy, JwtAuthGuard, RolesGuard], // ✅ Solo 2 guards
  controllers: [AuthController],
  exports: [
    JwtStrategy,
    JwtAuthGuard,      // ✅ Para endpoints que solo necesitan JWT
    RolesGuard      // ✅ Para endpoints que necesitan JWT + Roles
  ],
})
export class AuthModule {}