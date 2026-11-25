import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MembersModule } from './members/members.module';
import { SiteSettingsModule } from './site-settings/site-settings.module';
import { FinanceModule } from './finance/finance.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AdminModule } from './admin/admin.module';
import { OperationsModule } from './operations/operations.module';
import { CmsModule } from './cms/cms.module';
import { PublicModule } from './public/public.module';
import { RbacModule } from './rbac/rbac.module';
import { AttendanceModule } from './attendance/attendance.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    RbacModule,
    AuthModule,
    UsersModule,
    MembersModule,
    SiteSettingsModule,
    FinanceModule,
    DashboardModule,
    AdminModule,
    OperationsModule,
    AttendanceModule,
    CmsModule,
    PublicModule,
  ],
})
export class AppModule {}
