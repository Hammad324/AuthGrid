import { Injectable } from '@nestjs/common';
import {  SignInDto } from './dto/sign_in.dto';
import { AuthRepository } from './auth.repository';
import argon2 from 'argon2';
import { UnauthorizedException } from 'src/common/exceptions/app.exception';
import { JwtService } from '@nestjs/jwt';
import { AppsRepository } from 'src/apps/apps.repository';
import { AppTokenDto } from './dto/app-token.dto';
import { AuthSessionService, SessionDeviceInfo } from 'src/session/session.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
    private readonly appsRepository: AppsRepository,
    private readonly sessionService: AuthSessionService,
  ) {}

  async rotateRefreshToken(token: string) {
    const tokenRecord = await this.authRepository.findToken(token);
    
    if (!tokenRecord) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Check if the session itself is revoked or expired
    if (tokenRecord.isRevoked) {

      if (!tokenRecord.sessionId) {
        await this.authRepository.RevokeAlluserTokens(tokenRecord.userId);
        throw new UnauthorizedException('Token reuse detected. All sessions have been terminated.');
      }

      await this.authRepository.revokeSession(tokenRecord.sessionId);
    }

    // Check if the session itself is revoked or expired
  if (tokenRecord.session) {
    if (tokenRecord.session.isRevoked) {
      throw new UnauthorizedException('Session has been revoked');
    }
    if (new Date() > tokenRecord.session.expiresAt) {
      throw new UnauthorizedException('Session expired');
    }
  }
  if (new Date() > tokenRecord.expiresAt) {
    await this.authRepository.deleteToken(token);
    throw new UnauthorizedException('Refresh token expired');
  }
  await this.authRepository.revokeToken(token);
  // Touch the session to update lastActiveAt
  if (tokenRecord.sessionId) {
    await this.sessionService.touchSession(tokenRecord.sessionId);
  }
  const { user } = tokenRecord;
  const payload = {
    sub: user.id,
    name: user.name,
    email: user.email,
    sid: tokenRecord.sessionId, // preserve session ID
  };
  const accessToken = await this.jwtService.signAsync(payload);
  const refreshToken = await this.jwtService.signAsync(payload, { expiresIn: '7d' });
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  
  await this.authRepository.saveRefreshTokenWithSession(user.id, refreshToken, expiresAt, tokenRecord.sessionId);

  return { accessToken, refreshToken };
  }

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

  async login(signInDto: SignInDto, deviceInfo: SessionDeviceInfo) {

    const { email, passwordHash } = signInDto;

    const user = await this.authRepository.validateUser(signInDto); 

    const isPasswordValid = await argon2.verify(user.passwordHash, passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials', {code: `INVALID_CREDENTIALS`});
    }

    const sessionId = await this.sessionService.createSession(user.id, deviceInfo);


    const payload = {
      sub: user.id,
      name: user.name,
      email: user.email,
      sid: sessionId
    }

    const accessToken = await this.jwtService.signAsync(payload)
    const refreshToken = await this.jwtService.signAsync(payload, {expiresIn: '7d'})

    // Store the refresh token in the database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await this.authRepository.saveRefreshTokenWithSession(user.id, refreshToken, expiresAt, sessionId);

    return {
      accessToken,
      refreshToken
    }
  }

  async logout(refreshToken: string) {
     const tokenRecord = await this.authRepository.findToken(refreshToken);
  if (tokenRecord?.sessionId) {
    // Revoke the entire session (invalidates all its tokens)
    await this.authRepository.revokeSession(tokenRecord.sessionId);
  } else {
    await this.authRepository.revokeToken(refreshToken);
  }
  }

  async revoke(token: string) {
    if (!token) return; 
    try {
      await this.authRepository.revokeToken(token);
    } catch (error) {}
  }
}
