import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { FinanceDashboardService } from './finance-dashboard.service';

@Module({
  controllers: [DashboardController],
  providers: [DashboardService, FinanceDashboardService],
})
export class DashboardModule {}
