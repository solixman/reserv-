import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || '12zefmobyr764fam^pobuioaybiez3r9r7641alnaefùmoefaimae',
    });
  }

  async validate(payload: any) {
    Logger.log(payload);
    return { userId: payload.sub, email: payload.email, role: payload.role, name: payload.name };
  }
}
