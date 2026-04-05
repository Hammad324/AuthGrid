import { Injectable } from '@nestjs/common';
import { AppsRepository } from './apps.repository';
import { TenantsRepository } from 'src/tenants/tenants.repository';
import { CreateAppDto } from './dto/create-app.dto';
import { NotFoundException } from 'src/common/exceptions/app.exception';
import { randomUUID } from 'crypto';
import argon2 from 'argon2';

@Injectable()
export class AppsService {
    constructor(
        private readonly appsRepository: AppsRepository,
        private readonly tenantsRepository: TenantsRepository,
    ) {}

    async create(tenantSlug: string, createAppDto: CreateAppDto) {
        // Resolve slug → tenant
        const tenant = await this.tenantsRepository.findBySlug(tenantSlug);
        if (!tenant) {
            throw new NotFoundException('Tenant not found', { code: 'TENANT_NOT_FOUND' });
        }

        // Generate API keys
        const clientId = randomUUID();
        const rawClientSecret = randomUUID();
        const hashedSecret = await argon2.hash(rawClientSecret);

        // Save with hashed secret
        const app = await this.appsRepository.create(
            createAppDto.name,
            clientId,
            hashedSecret,
            tenant.id
        );

        // Return the raw secret ONLY THIS ONE TIME
        return {
            name: app.name,
            clientId: app.clientId,
            clientSecret: rawClientSecret,  // shown once, never again
        };
    }

    async findByTenantSlug(tenantSlug: string) {
        const tenant = await this.tenantsRepository.findBySlug(tenantSlug);
        if (!tenant) {
            throw new NotFoundException('Tenant not found', { code: 'TENANT_NOT_FOUND' });
        }

        return this.appsRepository.findByTenantId(tenant.id);
    }
}
