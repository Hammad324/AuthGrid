import { Injectable } from '@nestjs/common';
import {  SignInDto } from './dto/sign_in.dto';
import { AuthRepository } from './auth.repository';
import argon2 from 'argon2';
import { UnauthorizedException } from 'src/common/exceptions/app.exception';
import { JwtService } from '@nestjs/jwt';
import { AppsRepository } from 'src/apps/apps.repository';
import { AppTokenDto } from './dto/app-token.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
    private readonly appsRepository: AppsRepository
  ) {}

  async loginApp(appTokenDto: AppTokenDto) {
    const app = await this.appsRepository.findByClientId(appTokenDto.clientId);
    if (!app) {
      throw new UnauthorizedException('Invalid credentials', { code: 'INVALID_CREDENTIALS' });
    }

    const isValid = await argon2.verify(app.clientSecret, appTokenDto.clientSecret);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials', { code: 'INVALID_CREDENTIALS' });
    }

    const payload = {
      sub: app.id,
      clientId: app.clientId,
      tenantId: app.tenantId,
      type: 'app',
    };

    const accessToken = await this.jwtService.signAsync(payload, { expiresIn: '1h' });

    return { accessToken };
  }
  async login(signInDto: SignInDto) {

    const { email, passwordHash } = signInDto;

    const user = await this.authRepository.validateUser(signInDto); 

    const isPasswordValid = await argon2.verify(user.passwordHash, passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials', {code: `INVALID_CREDENTIALS`});
    }

    const payload = {
      sub: user.id,
      name: user.name,
      email: user.email,
    }

    const accessToken = await this.jwtService.signAsync(payload)
    const refreshToken = await this.jwtService.signAsync(payload, {expiresIn: '7d'})

    // Store the refresh token in the database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await this.authRepository.saveRefreshToken(user.id, refreshToken, expiresAt);

    return {
      accessToken,
      refreshToken
    }
  }

  async logout(refreshToken: string) {
    if (!refreshToken) return;
    await this.authRepository.deleteToken(refreshToken);
  }
}
