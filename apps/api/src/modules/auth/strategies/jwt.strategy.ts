import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export interface JwtPayload {
  sub: string;
  escolaId: string;
  papel: string;
  [key: string]: any;
}

export interface AuthenticatedUser {
  id: string;
  escolaId: string;
  papel: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(configService: ConfigService) {
    const secret = configService.get<string>('JWT_SECRET');
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret ?? 'secret',
    });
  }

  async validate(payload: any): Promise<AuthenticatedUser> {
    if (!payload || !payload.sub || !payload.escolaId || !payload.papel) {
      throw new UnauthorizedException('Token inválido.');
    }

    return {
      id: payload.sub,
      escolaId: payload.escolaId,
      papel: payload.papel,
    };
  }
}
