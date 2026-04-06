import { Injectable } from '@nestjs/common';
import { TenantsRepository } from './tenants.repository';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { SlugConflictException } from 'src/common/exceptions/app.exception';

@Injectable()
export class TenantsService {
    constructor(private readonly tenantsRepository: TenantsRepository) {}

    async create(userId: string, createTenantDto: CreateTenantDto) {
        const slug = createTenantDto.name
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')          // spaces → dashes
            .replace(/[^a-z0-9-]/g, '');   // remove special chars

        // Check for duplicate slug
        const existing = await this.tenantsRepository.findBySlug(slug);
        if (existing) {
            throw new SlugConflictException('A tenant with this name already exists', { code: 'SLUG_CONFLICT' });
        }

        return this.tenantsRepository.create(createTenantDto.name, slug, userId);
    }

    findMyTenants(userId: string) {
        return this.tenantsRepository.findByUserId(userId).then(memberships =>
            memberships.map(({ tenant: { id: _id, ...tenant }, ...membership }) => ({
                ...membership,
                tenant
            }))
        );
    }
}
