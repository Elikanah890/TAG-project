import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RoleName } from '../common/enums/roles.enum';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(private service: DashboardService) {}

  @Roles(RoleName.FINANCE_ADMIN, RoleName.SYSTEM_ADMIN)
  @Get('finance')
  finance(
    @Query('period') period?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) { return this.service.finance(period, from, to); }

  @Roles(RoleName.SYSTEM_ADMIN)
  @Get('admin')
  admin() { return this.service.admin(); }

  @Roles(RoleName.CHURCH_SECRETARY, RoleName.SYSTEM_ADMIN)
  @Get('secretary')
  secretary() { return this.service.secretary(); }
}
