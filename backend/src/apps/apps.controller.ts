import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { AppsService } from './apps.service';
import { CreateAppDto } from './dto/create-app.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('tenants/:slug/apps')
export class AppsController {
    constructor(private readonly appsService: AppsService) {}

    @Post('create')
    create(@Param('slug') slug: string, @Body() createAppDto: CreateAppDto) {
        return this.appsService.create(slug, createAppDto);
    }

    @Get()
    findAll(@Param('slug') slug: string) {
        return this.appsService.findByTenantSlug(slug);
    }
}
