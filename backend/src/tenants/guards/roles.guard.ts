import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from 'src/common/decorators/roles.decorator';
import { TenantsRepository } from '../tenants.repository';
import { ForbiddenException, NotFoundException } from 'src/common/exceptions/app.exception';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private tenantsRepository: TenantsRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles are defined, we assume it's open to all authenticated users
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const { slug } = request.params;

    if (!user || !slug) {
      return false;
    }

    // 1. Resolve slug to tenant
    const tenant = await this.tenantsRepository.findBySlug(slug);
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    // 2. Check membership and role
    const membership = await this.tenantsRepository.findMembership(user.id, tenant.id);

    if (!membership || membership.status !== 'ACTIVE') {
      throw new ForbiddenException('You are not a member of this tenant');
    }

    if (!requiredRoles.includes(membership.role)) {
      throw new ForbiddenException('Insufficient permissions for this action');
    }

    return true;
  }
}
