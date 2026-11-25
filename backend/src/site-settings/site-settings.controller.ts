import { Body, Controller, Get, Put, Req, UseGuards } from '@nestjs/common';
import { SiteSettingsService } from './site-settings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RoleName } from '../common/enums/roles.enum';

@Controller('site-settings')
export class SiteSettingsController {
  constructor(private service: SiteSettingsService) {}

  @Get('public')
  getPublic() {
    return this.service.getPublic();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.SYSTEM_ADMIN, RoleName.WEBSITE_ADMIN)
  @Get('admin')
  getAdmin() {
    return this.service.getAdmin();
  }

  // Operational CMS setting - WEBSITE_ADMIN only (SYSTEM_ADMIN oversees via reports, not routine publish)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.WEBSITE_ADMIN)
  @Put('admin')
  update(@Body() body: Record<string, string>, @Req() req: any) {
    return this.service.updateMany(body || {}, req.user?.userId);
  }
}
