import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { PermissionsGuard } from '../rbac/permissions.guard';
import { RequirePermissions } from '../rbac/require-permissions.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RoleName } from '../common/enums/roles.enum';
import { OversightService } from './oversight.service';

@Controller('admin/oversight')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles(RoleName.SYSTEM_ADMIN)
@RequirePermissions('reports.system.view')
export class OversightController {
  constructor(private service: OversightService) {}

  @RequirePermissions('reports.system.view')
  @Get('dashboard') dashboard(@Query('period') period?: string) { return this.service.dashboard(period); }
  @RequirePermissions('reports.system.view')
  @Get('church-dashboard') churchDashboard() { return this.service.churchDashboard(); }
  @RequirePermissions('reports.system.view')
  @Get('insights') insights() { return this.service.insights(); }

  @RequirePermissions('reports.membership.view')
  @Get('reports/membership') membership() { return this.service.membershipReport(); }
  @RequirePermissions('members.view')
  @Get('reports/registrations') registrations() { return this.service.registrationsReport(); }
  @RequirePermissions('reports.finance.view')
  @Get('reports/finance') finance() { return this.service.financeReport(); }
  @RequirePermissions('reports.departments.view')
  @Get('reports/departments') departments() { return this.service.departmentsReport(); }
  @RequirePermissions('reports.departments.view')
  @Get('reports/fellowships') fellowships() { return this.service.fellowshipsReport(); }
  @RequirePermissions('reports.attendance.view')
  @Get('reports/attendance') attendance() { return this.service.attendanceReport(); }
  @RequirePermissions('reports.system.view')
  @Get('reports/meetings') meetings() { return this.service.meetingsReport(); }
  @RequirePermissions('reports.system.view')
  @Get('reports/followups') followups() { return this.service.followupsReport(); }
  @RequirePermissions('reports.system.view')
  @Get('reports/tasks') tasks() { return this.service.tasksReport(); }
  @RequirePermissions('reports.system.view')
  @Get('reports/projects') projects() { return this.service.projectsReport(); }
  @RequirePermissions('reports.cms.view')
  @Get('reports/cms') cms() { return this.service.cmsReport(); }
  @RequirePermissions('reports.system.view')
  @Get('reports/participation') participation() { return this.service.participationReport(); }

  @RequirePermissions('reports.departments.view')
  @Get('org/departments') orgDepartments() { return this.service.orgDepartments(); }
  @RequirePermissions('reports.departments.view')
  @Get('org/fellowships') orgFellowships() { return this.service.orgFellowships(); }
  @RequirePermissions('reports.departments.view')
  @Get('org/leadership') orgLeadership() { return this.service.orgLeadership(); }
  @RequirePermissions('reports.departments.view')
  @Get('org/meetings') orgMeetings() { return this.service.orgMeetings(); }
  @RequirePermissions('reports.departments.view')
  @Get('org/performance') orgPerformance() { return this.service.orgPerformance(); }
  @RequirePermissions('reports.departments.view')
  @Get('org/outstanding') orgOutstanding() { return this.service.orgOutstanding(); }

  @RequirePermissions('audit.view')
  @Get('governance/audit-reports') auditReports() { return this.service.auditReports(); }
  @RequirePermissions('audit.view')
  @Get('governance/administrative-activity') adminActivity() { return this.service.administrativeActivity(); }
  @RequirePermissions('reports.finance.view')
  @Get('governance/financial-accountability') financialAccountability() { return this.service.financialAccountability(); }
  @RequirePermissions('audit.view')
  @Get('governance/access-history') accessHistory() { return this.service.accessHistory(); }
  @RequirePermissions('reports.system.view')
  @Get('governance/system-wide') systemWide() { return this.service.systemWide(); }

  @RequirePermissions('system.health')
  @Get('system/health') health() { return this.service.systemHealth(); }
  @RequirePermissions('audit.view')
  @Get('system/user-activity') userActivity(@Query('period') period?: string) { return this.service.userActivityReport(period); }
}
