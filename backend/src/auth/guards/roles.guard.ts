import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from '../roles';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    console.log('User in request:', user);

    if (!user || !user.role) {
      console.error('Access denied: Missing user or role in request');
      throw new UnauthorizedException('Access denied: No role found in token');
    }

    if (!requiredRoles.includes(user.role)) {
      console.warn(
        `Access denied for user ${user.username} with role ${user.role}`,
      );
      throw new UnauthorizedException('Insufficient role permissions');
    }

    return true;
  }
}
