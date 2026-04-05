import { Module, forwardRef } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { TenantsController } from './tenants.controller';
import { TenantsRepository } from './tenants.repository';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthModule } from 'src/auth/auth.module';
import { RolesGuard } from './guards/roles.guard';

@Module({
    imports: [forwardRef(() => AuthModule)],
    controllers: [TenantsController],
    providers: [TenantsService, TenantsRepository, PrismaService, RolesGuard],
    exports: [TenantsRepository, RolesGuard],
})
export class TenantsModule {}
