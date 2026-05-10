import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthCryptoService } from '../auth.crypto.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly cryptoService: AuthCryptoService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: cryptoService.getPublicKey(),
      algorithms: ['RS256'],
    });
  }

  async validate(payload: { sub: string; name: string; email: string }) {
    return { id: payload.sub, name: payload.name, email: payload.email }; // get the following info by decoding the jwt token
  }
}
