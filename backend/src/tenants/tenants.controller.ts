import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)       // All routes in this controller require a valid JWT
@Controller('tenants')
export class TenantsController {
    constructor(private readonly tenantsService: TenantsService) {}

    @Post('create')
    create(@Body() createTenantDto: CreateTenantDto, @Request() req) {
        return this.tenantsService.create(req.user.id, createTenantDto);
    }

    @Get('me')
    findMyTenants(@Request() req) {
        return this.tenantsService.findMyTenants(req.user.id);
    }
}
