import { Module } from '@nestjs/common';
import { DailyMessageService } from './daily-message.service';
import { DailyMessageController } from './daily-message.controller';
import { UserModule } from '../user/user.module';
import { EphemerisModule } from '../ephemeris/ephemeris.module';
import { TransitEngineModule } from '../transit-engine/transit-engine.module';
import { RuleEngineModule } from '../rule-engine/rule-engine.module';
import { AiLayerModule } from '../ai-layer/ai-layer.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    UserModule,
    EphemerisModule,
    TransitEngineModule,
    RuleEngineModule,
    AiLayerModule,
    NotificationsModule,
  ],
  controllers: [DailyMessageController],
  providers: [DailyMessageService],
  exports: [DailyMessageService],
})
export class DailyMessageModule {}
