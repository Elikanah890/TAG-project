import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AuditLogsController, SettingsController, SystemController } from './aliases.controller';
import { OversightController } from './oversight.controller';
import { OversightService } from './oversight.service';
import { AccessManagementService } from './access-management.service';

@Module({
  controllers: [AdminController, AuditLogsController, SettingsController, SystemController, OversightController],
  providers: [AdminService, OversightService, AccessManagementService],
})
export class AdminModule {}
