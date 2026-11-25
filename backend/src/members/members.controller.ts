import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { MembersService } from './members.service';
import { RegisterMemberDto } from './dto/register-member.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RoleName } from '../common/enums/roles.enum';

@Controller('members')
export class MembersController {
  constructor(private membersService: MembersService) {}

  @Post('register')
  register(@Body() dto: RegisterMemberDto) {
    return this.membersService.register(dto);
  }

  // READ / REPORTS - secretary workflow and system overseer
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.SYSTEM_ADMIN, RoleName.CHURCH_SECRETARY)
  @Get()
  findAll() {
    return this.membersService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.CHURCH_SECRETARY, RoleName.SYSTEM_ADMIN)
  @Get('pending')
  findPending() {
    return this.membersService.findPending();
  }

  // OPERATIONAL (membership workflow) - CHURCH_SECRETARY only; SYSTEM_ADMIN views reports only
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.CHURCH_SECRETARY)
  @Post(':id/approve')
  approve(@Param('id') id: string, @Req() req: any) {
    return this.membersService.approve(id, req.user?.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.CHURCH_SECRETARY)
  @Post(':id/reject')
  reject(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.membersService.reject(id, body?.reason, req.user?.userId);
  }

  // Credential reset is administrative workflow (secretary) - overseer does not perform member ops
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.CHURCH_SECRETARY)
  @Post(':id/reset-password')
  resetPassword(@Param('id') id: string, @Req() req: any) {
    return this.membersService.resetPassword(id, req.user?.userId);
  }

  // Member self-service: own profile only
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.CHURCH_MEMBER)
  @Get('me')
  me(@Req() req: any) {
    return this.membersService.myProfile(req.user?.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.CHURCH_MEMBER)
  @Patch('me')
  updateMe(@Body() body: any, @Req() req: any) {
    return this.membersService.updateMyProfile(req.user?.userId, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.CHURCH_MEMBER)
  @Post('requests')
  createRequest(@Body() body: any, @Req() req: any) {
    return this.membersService.createMyRequest(req.user?.userId, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.CHURCH_MEMBER)
  @Get('requests')
  listRequests(@Req() req: any) {
    return this.membersService.listMyRequests(req.user?.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.FINANCE_ADMIN)
  @Patch(':id/finance-contact')
  updateFinanceContact(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.membersService.updateFinanceContact(id, body, req.user?.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.CHURCH_SECRETARY, RoleName.SYSTEM_ADMIN)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.membersService.findOne(id);
  }
}
