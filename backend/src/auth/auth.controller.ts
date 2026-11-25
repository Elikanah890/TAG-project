import { Body, Controller, Delete, Get, Headers, HttpCode, Ip, Param, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LoginThrottleService } from './login-throttle.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private throttle: LoginThrottleService,
  ) {}

  @Post('login')
  @HttpCode(200)
  async login(
    @Body() dto: LoginDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent?: string,
  ) {
    this.throttle.assertAllowed(ip, dto.email);
    try {
      const result = await this.authService.login(dto.email, dto.password, { ip, userAgent });
      this.throttle.recordSuccess(ip, dto.email);
      return result;
    } catch (error) {
      this.throttle.recordFailure(ip, dto.email);
      throw error;
    }
  }

  @Post('refresh')
  @HttpCode(200)
  async refresh(
    @Body() body: { refreshToken?: string },
    @Ip() ip: string,
    @Headers('user-agent') userAgent?: string,
  ) {
    return this.authService.refresh(body?.refreshToken || '', { ip, userAgent });
  }

  @Post('logout')
  @HttpCode(200)
  async logout(@Body() body: { refreshToken?: string }) {
    return this.authService.logout(body?.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() req: any) {
    return this.authService.me(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('sessions')
  async sessions(@Req() req: any) {
    return this.authService.listSessions(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('sessions/:id')
  async revokeSession(@Param('id') id: string, @Req() req: any) {
    return this.authService.revokeSession(req.user.userId, id, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('sessions/revoke-all')
  @HttpCode(200)
  async revokeAll(@Req() req: any) {
    return this.authService.revokeAllSessions(req.user.userId, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  @HttpCode(200)
  async changePassword(@Body() dto: ChangePasswordDto, @Req() req: any) {
    return this.authService.changePassword(req.user.userId, dto.currentPassword, dto.newPassword);
  }
}
