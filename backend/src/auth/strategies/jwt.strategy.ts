import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'default_secret',
    });
  }

  async validate(payload: any) {
    console.log('🔧 JwtStrategy.validate ejecutado!');
    console.log('🔧 Payload:', payload);
    
    const user = {
      _id: payload.sub,
      username: payload.username,
      role: payload.role,
    };

    console.log('🔧 Usuario retornado:', user);
    return user;
  }
}