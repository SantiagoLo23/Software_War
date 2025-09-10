import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    console.log('🔧 JwtAuthGuard ejecutado');
    return super.canActivate(context);
  }

  handleRequest(err, user, info, context, status) {
    console.log('🔧 JwtAuthGuard handleRequest');
    console.log('🔧 User:', user);
    console.log('🔧 Error:', err);
    
    if (err || !user) {
      throw err || new UnauthorizedException('JWT validation failed');
    }
    return user;
  }
}