import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign_in.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LogoutDto } from './dto/logout.dto';
import { AppTokenDto } from './dto/app-token.dto';
import { RefreshDto } from './dto/refresh.dto';
import { AuthCryptoService } from './auth.crypto.service';
import { Request as ExpressRequest } from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly cryptoService: AuthCryptoService
  ) {}

  @Get('.well-known/jwks.json') 
  getJwks() {
    return this.cryptoService.getJwks();
  }

  @Post('login')
  signIn(@Body() signInDto: SignInDto, @Request() req) {
    const userAgent = req.headers['user-agent'] || 'Unknown User-Agent';
    const ipAddress = (req.headers['x-forwarded-for'] as string) || req.ip || '127.0.0.1';
    return this.authService.login(signInDto, { userAgent, ipAddress });
  }

  @Post('refresh')
  refresh(@Body() refreshDto: RefreshDto) {
    return this.authService.rotateRefreshToken(refreshDto.refreshToken);
  }

  @Post('app/token')
  loginApp(@Body() appTokenDto: AppTokenDto) {
    return this.authService.loginApp(appTokenDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Body() logoutDto: LogoutDto) {
    return this.authService.logout(logoutDto.refreshToken);
  }

  @Post('revoke')
  revokeToken(@Body('token') token: string) {
    return this.authService.revoke(token);
  }

  @UseGuards(JwtAuthGuard)
  @Get('sessions')
  async getSessions(@Request() req) {
    const sessions = await this.authService['sessionService'].getUserSessions(req.user.id);
    return sessions.map(session => ({
      ...session,
      isCurrent: session.id === req.user.sessionId,
    }));
  }

  @UseGuards(JwtAuthGuard)
  @Delete('sessions/:id')
  revokeSession(@Param('id') id: string, @Request() req) {
    return this.authService['sessionService'].revokeSession(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('sessions/revoke-all')
  revokeAllSessions(@Request() req) {
    return this.authService['sessionService'].revokeAllSessions(req.user.id);
  }
}
