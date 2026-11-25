import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { RecordSundayAttendanceDto } from './dto/record-sunday-attendance.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RoleName } from '../common/enums/roles.enum';

@Controller('attendance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AttendanceController {
  constructor(private service: AttendanceService) {}

  @Roles(RoleName.CHURCH_SECRETARY, RoleName.SYSTEM_ADMIN)
  @Post('sunday')
  recordSunday(@Body() dto: RecordSundayAttendanceDto, @Req() req: any) {
    return this.service.recordSunday(dto, req.user?.userId);
  }

  @Roles(RoleName.SYSTEM_ADMIN, RoleName.CHURCH_SECRETARY)
  @Get('sunday/latest')
  latestSunday() {
    return this.service.latestSunday();
  }

  @Roles(RoleName.SYSTEM_ADMIN, RoleName.CHURCH_SECRETARY)
  @Get('sunday')
  listSunday() {
    return this.service.listSunday();
  }
}
