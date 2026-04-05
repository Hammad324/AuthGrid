import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AppsRepository {
    constructor(private readonly prisma: PrismaService) {}

    create(name: string, clientId: string, clientSecret: string, tenantId: string) {
        return this.prisma.app.create({
            data: { name, clientId, clientSecret, tenantId }
        });
    }

    findByTenantId(tenantId: string) {
        return this.prisma.app.findMany({
            where: { tenantId },
            select: {
                name: true,
                clientId: true,    // public key — safe to show
                createdAt: true
                // clientSecret is NOT selected — never exposed in list
            }
        });
    }

    findByClientId(clientId: string) {
        return this.prisma.app.findUnique({
            where: { clientId }
        });
    }
}
