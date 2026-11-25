import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { OperationsService } from './operations.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RoleName } from '../common/enums/roles.enum';

@Controller('operations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OperationsController {
  constructor(private service: OperationsService) {}

  // READ-ONLY oversight for System Admin (and future scoped roles can be added)
  @Roles(RoleName.SYSTEM_ADMIN, RoleName.CHURCH_SECRETARY)
  @Get('departments') deps(){ return this.service.listDepartments(); }
  @Roles(RoleName.SYSTEM_ADMIN, RoleName.CHURCH_SECRETARY)
  @Get('fellowships') fels(){ return this.service.listFellowships(); }
  @Roles(RoleName.SYSTEM_ADMIN, RoleName.CHURCH_SECRETARY)
  @Get('meetings') meets(){ return this.service.listMeetings(); }
  @Roles(RoleName.SYSTEM_ADMIN, RoleName.CHURCH_SECRETARY)
  @Get('attendance') att(@Query('meetingId') meetingId?:string){ return this.service.listAttendance(meetingId); }
  @Roles(RoleName.SYSTEM_ADMIN, RoleName.CHURCH_SECRETARY)
  @Get('followups') fol(){ return this.service.listFollowups(); }
  @Roles(RoleName.SYSTEM_ADMIN, RoleName.CHURCH_SECRETARY)
  @Get('tasks') tasks(){ return this.service.listTasks(); }

  // OPERATIONAL writes are NOT permitted to SYSTEM_ADMIN overseer (deny by default - no write routes exposed to SYS_ADMIN)
  // If operational roles are added later, grant them explicitly on dedicated endpoints.
  @Roles(RoleName.CHURCH_SECRETARY)
  @Post('departments') cDep(@Body() b:any,@Req() r:any){ return this.service.createDepartment(b,r.user?.userId); }
  @Roles(RoleName.CHURCH_SECRETARY)
  @Put('departments/:id') uDep(@Param('id') id:string,@Body() b:any,@Req() r:any){ return this.service.updateDepartment(id,b,r.user?.userId); }
  @Roles(RoleName.CHURCH_SECRETARY)
  @Delete('departments/:id') dDep(@Param('id') id:string,@Req() r:any){ return this.service.deleteDepartment(id,r.user?.userId); }
  @Roles(RoleName.CHURCH_SECRETARY)
  @Post('fellowships') cFel(@Body() b:any,@Req() r:any){ return this.service.createFellowship(b,r.user?.userId); }
  @Roles(RoleName.CHURCH_SECRETARY)
  @Put('fellowships/:id') uFel(@Param('id') id:string,@Body() b:any,@Req() r:any){ return this.service.updateFellowship(id,b,r.user?.userId); }
  @Roles(RoleName.CHURCH_SECRETARY)
  @Delete('fellowships/:id') dFel(@Param('id') id:string,@Req() r:any){ return this.service.deleteFellowship(id,r.user?.userId); }
  @Roles(RoleName.CHURCH_SECRETARY)
  @Post('meetings') cMeet(@Body() b:any,@Req() r:any){ return this.service.createMeeting(b,r.user?.userId); }
  @Roles(RoleName.CHURCH_SECRETARY)
  @Put('meetings/:id') uMeet(@Param('id') id:string,@Body() b:any,@Req() r:any){ return this.service.updateMeeting(id,b,r.user?.userId); }
  @Roles(RoleName.CHURCH_SECRETARY)
  @Delete('meetings/:id') dMeet(@Param('id') id:string,@Req() r:any){ return this.service.deleteMeeting(id,r.user?.userId); }
  @Roles(RoleName.CHURCH_SECRETARY)
  @Post('attendance') cAtt(@Body() b:any,@Req() r:any){ return this.service.createAttendance(b,r.user?.userId); }
  @Roles(RoleName.CHURCH_SECRETARY)
  @Delete('attendance/:id') dAtt(@Param('id') id:string,@Req() r:any){ return this.service.deleteAttendance(id,r.user?.userId); }
  @Roles(RoleName.CHURCH_SECRETARY)
  @Post('followups') cFol(@Body() b:any,@Req() r:any){ return this.service.createFollowup(b,r.user?.userId); }
  @Roles(RoleName.CHURCH_SECRETARY)
  @Put('followups/:id') uFol(@Param('id') id:string,@Body() b:any,@Req() r:any){ return this.service.updateFollowup(id,b,r.user?.userId); }
  @Roles(RoleName.CHURCH_SECRETARY)
  @Delete('followups/:id') dFol(@Param('id') id:string,@Req() r:any){ return this.service.deleteFollowup(id,r.user?.userId); }
  @Roles(RoleName.CHURCH_SECRETARY)
  @Post('tasks') cTask(@Body() b:any,@Req() r:any){ return this.service.createTask(b,r.user?.userId); }
  @Roles(RoleName.CHURCH_SECRETARY)
  @Put('tasks/:id') uTask(@Param('id') id:string,@Body() b:any,@Req() r:any){ return this.service.updateTask(id,b,r.user?.userId); }
  @Roles(RoleName.CHURCH_SECRETARY)
  @Delete('tasks/:id') dTask(@Param('id') id:string,@Req() r:any){ return this.service.deleteTask(id,r.user?.userId); }
}
