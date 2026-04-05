import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TenantsRepository {
    constructor(private readonly prisma: PrismaService) {}

    // Atomic: creates Tenant + OWNER Membership in a single transaction
    create(name: string, slug: string, userId: string) {
        return this.prisma.$transaction(async (tx) => {
            const tenant = await tx.tenant.create({
                data: { name, slug, createdBy: userId }
            });

            await tx.membership.create({
                data: {
                    userId,
                    tenantId: tenant.id,
                    role: 'OWNER',
                    status: 'ACTIVE',
                }
            });

            return tenant;
        });
    }

    findBySlug(slug: string) {
        return this.prisma.tenant.findUnique({
            where: { slug }
        });
    }

    // Find all memberships for a user and include the tenant details
    findByUserId(userId: string) {
        return this.prisma.membership.findMany({
            where: { userId },
            select: {
                role: true, 
                status: true,
                tenant: {
                    select: {
                        id: true,
                        name: true,
                        slug: true
                    }
                }
            }
        });
    }
}
