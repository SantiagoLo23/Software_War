import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from '../roles';

@Injectable()
export class RolesGuard extends AuthGuard('jwt') implements CanActivate {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    console.log('🔧 RolesGuard - Iniciando validación');

    // 1. Primero ejecutar la validación JWT
    const jwtValid = await super.canActivate(context);
    if (!jwtValid) {
      console.log('🔧 RolesGuard - JWT inválido');
      return false;
    }

    console.log('🔧 RolesGuard - JWT válido, verificando roles');

    // 2. Obtener los roles requeridos
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // 3. Si no hay roles requeridos, permitir acceso
    if (!requiredRoles) {
      console.log('🔧 RolesGuard - No hay roles requeridos, acceso permitido');
      return true;
    }

    // 4. Verificar el rol del usuario
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    console.log('🔧 RolesGuard - Usuario:', user);
    console.log('🔧 RolesGuard - Roles requeridos:', requiredRoles);

    if (!user || !user.role) {
      console.log('🔧 RolesGuard - Usuario o rol no encontrado');
      throw new UnauthorizedException('Role not found');
    }

    const hasRole = requiredRoles.includes(user.role);
    console.log('🔧 RolesGuard - ¿Tiene el rol?', hasRole);

    if (!hasRole) {
      throw new UnauthorizedException('Insufficient permissions');
    }

    return true;
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    console.log('🔧 RolesGuard handleRequest');
    console.log('🔧 User:', user);
    console.log('🔧 Error:', err);
    console.log('🔧 Info:', info);

    // Si user es false pero no hay error, algo está mal con la validación JWT
    if (user === false && !err) {
      console.log('🔧 RolesGuard - User es false sin error, problema con JWT');
      throw new UnauthorizedException('JWT token invalid or expired');
    }

    if (err) {
      console.log('🔧 RolesGuard - Error en JWT:', err);
      throw err;
    }

    if (!user) {
      console.log('🔧 RolesGuard - Usuario no encontrado');
      throw new UnauthorizedException('JWT validation failed');
    }

    console.log('🔧 RolesGuard - Usuario válido:', user);
    return user;
  }
}