import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AccessManagementService } from './access-management.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../rbac/permissions.guard';
import { RequirePermissions } from '../rbac/require-permissions.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AdminController {
  constructor(
    private service: AdminService,
    private access: AccessManagementService,
  ) {}

  // ---------------- Users ----------------
  @RequirePermissions('users.view')
  @Get('users')
  listUsers(@Query() query: any) {
    return this.access.listUsers(query);
  }

  @RequirePermissions('users.view')
  @Get('users/:id')
  getUser(@Param('id') id: string) {
    return this.access.getUserDetail(id);
  }

  @RequirePermissions('users.view')
  @Get('users/:id/activity')
  getUserActivity(@Param('id') id: string) {
    return this.access.getUserActivity(id);
  }

  @RequirePermissions('users.view')
  @Get('users/:id/permissions')
  getUserPermissions(@Param('id') id: string) {
    return this.access.effectiveAccess(id);
  }

  @RequirePermissions('users.create')
  @Post('users')
  createUser(@Body() body: any, @Req() req: any) {
    return this.access.createUser(body, req.user?.userId);
  }

  @RequirePermissions('users.edit')
  @Patch('users/:id')
  updateUser(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.access.updateUser(id, body, req.user?.userId);
  }

  @RequirePermissions('users.edit')
  @Put('users/:id')
  replaceUser(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.access.updateUser(id, body, req.user?.userId);
  }

  @RequirePermissions('users.assign_roles')
  @Patch('users/:id/roles')
  assignRoles(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.access.assignRoles(id, body, req.user?.userId);
  }

  @RequirePermissions('users.reset_password')
  @Post('users/:id/reset-password')
  resetPassword(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.access.resetPassword(id, body || {}, req.user?.userId);
  }

  @RequirePermissions('users.suspend')
  @Post('users/:id/suspend')
  suspend(@Param('id') id: string, @Req() req: any) {
    return this.access.setStatus(id, 'SUSPENDED', req.user?.userId);
  }

  @RequirePermissions('users.suspend')
  @Post('users/:id/activate')
  activate(@Param('id') id: string, @Req() req: any) {
    return this.access.setStatus(id, 'ACTIVE', req.user?.userId);
  }

  @RequirePermissions('users.sessions_revoke')
  @Post('users/:id/sessions/revoke-all')
  revokeUserSessions(@Param('id') id: string, @Req() req: any) {
    return this.access.revokeUserSessions(id, req.user?.userId);
  }

  // ---------------- Roles ----------------
  @RequirePermissions('roles.view')
  @Get('roles')
  roles() {
    return this.access.listRoles();
  }

  @RequirePermissions('roles.view')
  @Get('roles/:id/users')
  roleUsers(@Param('id') id: string) {
    return this.access.roleUsers(id);
  }

  @RequirePermissions('roles.create')
  @Post('roles')
  createRole(@Body() body: any, @Req() req: any) {
    return this.access.createRole(body, req.user?.userId);
  }

  @RequirePermissions('roles.edit')
  @Patch('roles/:id')
  updateRole(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.access.updateRole(id, body, req.user?.userId);
  }

  @RequirePermissions('roles.edit')
  @Put('roles/:id')
  replaceRole(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.access.updateRole(id, body, req.user?.userId);
  }

  @RequirePermissions('roles.edit')
  @Patch('roles/:id/status')
  setRoleStatus(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.access.setRoleStatus(id, Boolean(body?.isActive), req.user?.userId);
  }

  @RequirePermissions('roles.delete')
  @Delete('roles/:id')
  deleteRole(@Param('id') id: string, @Req() req: any) {
    return this.access.deleteRole(id, req.user?.userId);
  }

  @RequirePermissions('roles.assign_permissions')
  @Put('roles/:id/permissions')
  setRolePermissions(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.access.setRolePermissions(id, body?.permissionCodes || [], req.user?.userId);
  }

  // ---------------- Permissions ----------------
  @RequirePermissions('permissions.view')
  @Get('permissions')
  permissions() {
    return this.access.listPermissionCatalog();
  }

  @RequirePermissions('permissions.manage')
  @Post('permissions')
  createPermission(@Body() body: any, @Req() req: any) {
    return this.access.createPermission(body, req.user?.userId);
  }

  @RequirePermissions('permissions.manage')
  @Patch('permissions/:id')
  updatePermission(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.access.updatePermission(id, body, req.user?.userId);
  }

  @RequirePermissions('permissions.manage')
  @Put('permissions/:id')
  replacePermission(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.access.updatePermission(id, body, req.user?.userId);
  }

  @RequirePermissions('permissions.manage')
  @Delete('permissions/:id')
  deletePermission(@Param('id') id: string, @Req() req: any) {
    return this.access.deletePermission(id, req.user?.userId);
  }

  // ---------------- Role assignment history ----------------
  @RequirePermissions('audit.view')
  @Get('role-assignments')
  roleAssignments(@Query() query: any) {
    return this.access.roleAssignmentHistory(query);
  }

  // ---------------- Sessions ----------------
  @RequirePermissions('system.sessions')
  @Get('sessions')
  sessions(@Query() query: any) {
    return this.access.listAllSessions(query);
  }

  @RequirePermissions('system.sessions')
  @Delete('sessions/:id')
  revokeSession(@Param('id') id: string, @Req() req: any) {
    return this.access.revokeAnySession(id, req.user?.userId);
  }

  // ---------------- Audit ----------------
  @RequirePermissions('audit.view')
  @Get('audit-logs')
  auditLogs(@Query() query: any) {
    return this.access.auditLogs(query);
  }

  // ---------------- Settings ----------------
  @RequirePermissions('system.settings')
  @Get('settings')
  getSettings() {
    return this.service.getSettings();
  }

  @RequirePermissions('system.settings')
  @Put('settings')
  updateSettings(@Body() body: any, @Req() req: any) {
    return this.service.updateSettings(body || {}, req.user?.userId);
  }

  // ---------------- System ----------------
  @RequirePermissions('system.health')
  @Get('system/health')
  health() {
    return this.service.health();
  }

  @RequirePermissions('system.backup')
  @Post('system/backup')
  backup(@Req() req: any) {
    return this.service.backup(req.user?.userId);
  }

  @RequirePermissions('system.backup')
  @Get('system/backups')
  backups() {
    return this.service.backupLogs();
  }

  @RequirePermissions('system.notifications')
  @Get('notifications')
  notifications() {
    return this.service.notifications();
  }

  @RequirePermissions('system.notifications')
  @Post('notifications')
  createNotification(@Body() body: any, @Req() req: any) {
    return this.service.createNotification(body, req.user?.userId);
  }

  @RequirePermissions('system.config')
  @Get('budgets')
  budgets() {
    return this.service.budgets();
  }

  @RequirePermissions('system.config')
  @Post('budgets')
  createBudget(@Body() body: any, @Req() req: any) {
    return this.service.createBudget(body, req.user?.userId);
  }

  @RequirePermissions('system.config')
  @Get('projects')
  projects() {
    return this.service.projects();
  }

  @RequirePermissions('system.config')
  @Post('projects')
  createProject(@Body() body: any, @Req() req: any) {
    return this.service.createProject(body, req.user?.userId);
  }

  @RequirePermissions('reports.system.view')
  @Get('reports')
  reports() {
    return this.service.systemReports();
  }

  @RequirePermissions('users.view')
  @Get('user-activity')
  userActivity() {
    return this.service.userActivity();
  }
}
