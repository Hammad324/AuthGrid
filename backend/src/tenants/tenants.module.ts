import { Module, forwardRef } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { TenantsController } from './tenants.controller';
import { TenantsRepository } from './tenants.repository';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
    imports: [forwardRef(() => AuthModule)],
    controllers: [TenantsController],
    providers: [TenantsService, TenantsRepository, PrismaService],
    exports: [TenantsRepository],
})
export class TenantsModule {}
