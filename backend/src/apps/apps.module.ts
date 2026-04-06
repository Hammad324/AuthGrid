import { Module, forwardRef } from '@nestjs/common';
import { AppsService } from './apps.service';
import { AppsController } from './apps.controller';
import { AppsRepository } from './apps.repository';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthModule } from 'src/auth/auth.module';
import { TenantsModule } from 'src/tenants/tenants.module';

@Module({
    imports: [forwardRef(() => AuthModule), forwardRef(() => TenantsModule)],
    controllers: [AppsController],
    providers: [AppsService, AppsRepository, PrismaService],
    exports: [AppsRepository],
})
export class AppsModule {}
