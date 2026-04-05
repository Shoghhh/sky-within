import { Module } from '@nestjs/common';
import { NatalChartDetailService } from './natal-chart-detail.service';
import { NatalPriorityService } from './natal-priority.service';

@Module({
  providers: [NatalChartDetailService, NatalPriorityService],
  exports: [NatalChartDetailService, NatalPriorityService],
})
export class NatalChartDetailModule {}
