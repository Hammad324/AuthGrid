import { Injectable, Logger } from '@nestjs/common';
import { AuthRepository } from 'src/auth/auth.repository';
import { NotFoundException, ForbiddenException } from 'src/common/exceptions/app.exception';

export interface SessionDeviceInfo {
  userAgent?: string;
  ipAddress?: string;
  deviceName?: string;
}

const max_sessions = parseInt(process.env.MAX_CONCURRENT_SESSIONS || '5');
const session_ttl_days = parseInt(process.env.SESSION_TTL_DAYS || '30');

@Injectable()
export class AuthSessionService {
  private readonly logger = new Logger(AuthSessionService.name);

  constructor(private readonly authRepository: AuthRepository) {}

  async createSession(userId: string, deviceInfo: SessionDeviceInfo): Promise<string> {
    // 1. Enforce concurrent session limit — evict oldest if at capacity
    const activeSessions = await this.authRepository.findActiveSessionsByUser(userId);

    if (activeSessions.length >= max_sessions) {
      const sessionsToEvict = activeSessions
        .sort((a, b) => a.lastActiveAt.getTime() - b.lastActiveAt.getTime())
        .slice(0, activeSessions.length - max_sessions + 1);

      for (const session of sessionsToEvict) {
        this.logger.warn(`Evicting oldest session ${session.id} for user ${userId} (limit: ${max_sessions})`);
        await this.authRepository.revokeSession(session.id);
      }
    }

    // 2. Create the new session
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + session_ttl_days);

    const session = await this.authRepository.createSession({
      userId,
      deviceName: deviceInfo.deviceName ?? this.parseDeviceName(deviceInfo.userAgent),
      userAgent: deviceInfo.userAgent,
      ipAddress: deviceInfo.ipAddress,
      expiresAt,
    });

    return session.id;
  }

  async getUserSessions(userId: string) {
    const sessions = await this.authRepository.findActiveSessionsByUser(userId);
    return sessions.map((s) => ({
      id: s.id,
      deviceName: s.deviceName,
      ipAddress: s.ipAddress,
      location: s.location,
      lastActiveAt: s.lastActiveAt,
      createdAt: s.createdAt,
      isCurrent: false, // will be set by the controller
    }));
  }

  async revokeSession(sessionId: string, requestingUserId: string): Promise<void> {
    const session = await this.authRepository.findSessionById(sessionId);

    if (!session || session.isRevoked) {
      throw new NotFoundException('Session not found', { code: 'SESSION_NOT_FOUND' });
    }

    if (session.userId !== requestingUserId) {
      throw new ForbiddenException('Cannot revoke another user\'s session', { code: 'FORBIDDEN' });
    }

    await this.authRepository.revokeSession(sessionId);
  }

  async revokeAllSessions(userId: string): Promise<number> {
    return this.authRepository.revokeAllUserSessions(userId);
  }

  async touchSession(sessionId: string): Promise<void> {
    await this.authRepository.touchSession(sessionId);
  }

  private parseDeviceName(userAgent?: string): string {
    if (!userAgent) return 'Unknown Device';
    let browser = 'Unknown Browser';
    let os = 'Unknown OS';

    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) browser = 'Safari';
    else if (userAgent.includes('Edg')) browser = 'Edge';

    if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Mac OS')) os = 'macOS';
    else if (userAgent.includes('Linux')) os = 'Linux';
    else if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) os = 'iOS';

    return `${browser} on ${os}`;
  }
}
