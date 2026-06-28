import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { AuthRepository } from './auth.repository';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AppsModule } from 'src/apps/apps.module';
import { AuthCryptoService } from './auth.crypto.service';
import { AuthCryptoModule } from './auth.crypto.module';
import { SessionModule } from '../session/session.module';

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    AuthCryptoModule,
    forwardRef(() => AppsModule),
    forwardRef(() => SessionModule),

    JwtModule.registerAsync({

      global: true,
      imports: [AuthCryptoModule],
      inject: [AuthCryptoService],
      useFactory: (cryptoService: AuthCryptoService) => {
        return {
          privateKey: cryptoService.getPrivateKey(),
          publicKey: cryptoService.getPublicKey(),
          signOptions: {
            expiresIn: '1h',
            algorithm: 'RS256',
            keyid: process.env.OAUTH_KEYID
          },
          verifyOptions: {
            algorithms: ['RS256']
          }
        }
      }

    })
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthRepository, JwtStrategy, AuthCryptoService],
  exports: [AuthCryptoService, AuthRepository]
})
export class AuthModule {}
