import { Body, Controller, Get, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RoleName } from '../common/enums/roles.enum';
import { PermissionsGuard } from '../rbac/permissions.guard';
import { RequirePermissions } from '../rbac/require-permissions.decorator';

@Controller('audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles(RoleName.SYSTEM_ADMIN)
@RequirePermissions('audit.view')
export class AuditLogsController {
  constructor(private service: AdminService) {}
  @Get() list(@Query('limit') limit?: string) { return this.service.auditLogs(limit ? Number(limit) : 100); }
}

@Controller('settings')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles(RoleName.SYSTEM_ADMIN)
@RequirePermissions('system.settings')
export class SettingsController {
  constructor(private service: AdminService) {}
  @Get() get() { return this.service.getSettings(); }
  @Put() update(@Body() body: any, @Req() req: any) { return this.service.updateSettings(body || {}, req.user?.userId); }
}

@Controller('system')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles(RoleName.SYSTEM_ADMIN)
@RequirePermissions('system.health')
export class SystemController {
  constructor(private service: AdminService) {}
  @Get('health') health() { return this.service.health(); }
  @RequirePermissions('system.backup')
  @Post('backup') backup(@Req() req: any) { return this.service.backup(req.user?.userId); }
  @RequirePermissions('system.backup')
  @Get('backups') backups() { return this.service.backupLogs(); }
}
