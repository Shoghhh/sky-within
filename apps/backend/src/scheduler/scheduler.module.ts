import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SchedulerService } from './scheduler.service';
import { DailyMessageModule } from '../daily-message/daily-message.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [ScheduleModule.forRoot(), DailyMessageModule, UserModule],
  providers: [SchedulerService],
})
export class SchedulerModule {}
