import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { AppsService } from './apps.service';
import { CreateAppDto } from './dto/create-app.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/tenants/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('tenants/:slug/apps')
export class AppsController {
    constructor(private readonly appsService: AppsService) {}

    @Post('create')
    @Roles(Role.OWNER, Role.ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    create(@Param('slug') slug: string, @Body() createAppDto: CreateAppDto) {
        return this.appsService.create(slug, createAppDto);
    }

    @Get()
    @Roles(Role.OWNER, Role.ADMIN, Role.MEMBER)
    @UseGuards(JwtAuthGuard, RolesGuard)
    findAll(@Param('slug') slug: string) {
        return this.appsService.findByTenantSlug(slug);
    }
}
