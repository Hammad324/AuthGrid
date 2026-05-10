import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { SignInDto } from "./dto/sign_in.dto";
import { NotFoundException } from "src/common/exceptions/app.exception";

@Injectable()
export class AuthRepository {
    constructor(private readonly prisma: PrismaService) {}

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

    async saveRefreshToken(userId: string, token: string, expiresAt: Date) {
        return this.prisma.refreshToken.create({
            data: { userId, token, expiresAt }
        });
    }

    async findToken(token: string) {
        return this.prisma.refreshToken.findUnique({
            where: { token },
            include: { user: true }
        });
    }

    async revokeToken(token: string) {
        return this.prisma.refreshToken.update({
            where: { token },
            data: { isRevoked: true }
        });
    }

    async RevokeAlluserTokens(userId: string) {
        return this.prisma.refreshToken.deleteMany({
            where: { userId }
        })
    }
}
