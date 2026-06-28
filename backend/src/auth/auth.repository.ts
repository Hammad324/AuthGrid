import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { SignInDto } from "./dto/sign_in.dto";
import { NotFoundException } from "src/common/exceptions/app.exception";

@Injectable()
export class AuthRepository {
    constructor(private readonly prisma: PrismaService) {}

    async createSession(data: {
  userId: string;
  deviceName?: string;
  userAgent?: string;
  ipAddress?: string;
  expiresAt: Date;
}) {
  return this.prisma.session.create({ data });
}
async findSessionById(id: string) {
  return this.prisma.session.findUnique({
    where: { id },
  });
}
async findActiveSessionsByUser(userId: string) {
  return this.prisma.session.findMany({
    where: {
      userId,
      isRevoked: false,
      expiresAt: { gt: new Date() },
    },
    orderBy: { lastActiveAt: 'desc' },
  });
}
async revokeSession(sessionId: string) {
  // Revoke the session AND all its refresh tokens atomically
  return this.prisma.$transaction([
    this.prisma.session.update({
      where: { id: sessionId },
      data: { isRevoked: true },
    }),
    this.prisma.refreshToken.updateMany({
      where: { sessionId },
      data: { isRevoked: true },
    }),
  ]);
}
async revokeAllUserSessions(userId: string): Promise<number> {
  const result = await this.prisma.$transaction([
    this.prisma.session.updateMany({
      where: { userId, isRevoked: false },
      data: { isRevoked: true },
    }),
    this.prisma.refreshToken.updateMany({
      where: { userId },
      data: { isRevoked: true },
    }),
  ]);
  return result[0].count; // number of sessions revoked
}
async touchSession(sessionId: string) {
  return this.prisma.session.update({
    where: { id: sessionId },
    data: { lastActiveAt: new Date() },
  });
}


    async validateUser(signInDto: SignInDto) {
        const { email } = signInDto;

        const user = await this.prisma.user.findUnique({
            where: { email }
        })

        if (!user) {
            throw new NotFoundException('User not found', {code: `USER_NOT_FOUND`}); 
        }

        return user;
    }

    async deleteToken(token: string) {
        await this.prisma.refreshToken.delete({
            where: { token }
        })
    }

    async saveRefreshTokenWithSession(userId: string, token: string, expiresAt: Date, sessionId: string) {
        return this.prisma.refreshToken.create({
            data: { userId, token, expiresAt, sessionId }
        });
    }

    async findToken(token: string) {
        return this.prisma.refreshToken.findUnique({
            where: { token },
            include: { user: true, session: true }
        });
    }

    async revokeToken(token: string) {
        return this.prisma.refreshToken.update({
            where: { token },
            data: { isRevoked: true  }
        });
    }

    async RevokeAlluserTokens(userId: string) {
        return this.prisma.refreshToken.deleteMany({
            where: { userId }
        })
    }
}
