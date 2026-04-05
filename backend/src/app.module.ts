import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TenantsModule } from './tenants/tenants.module';
import { AppsModule } from './apps/apps.module';

@Module({
<<<<<<< HEAD
  imports: [PrismaModule, UsersModule, AuthModule, TenantsModule, AppsModule],
=======
  imports: [PrismaModule, UsersModule, AuthModule],
>>>>>>> 9454f0164128ef8aedef1019443c80c4d37b582f
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
