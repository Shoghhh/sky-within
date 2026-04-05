import { join } from 'path';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { EphemerisModule } from './ephemeris/ephemeris.module';
import { TransitEngineModule } from './transit-engine/transit-engine.module';
import { RuleEngineModule } from './rule-engine/rule-engine.module';
import { AiLayerModule } from './ai-layer/ai-layer.module';
import { NotificationsModule } from './notifications/notifications.module';
import { DailyMessageModule } from './daily-message/daily-message.module';
import { JournalModule } from './journal/journal.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { EducationModule } from './education/education.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // cwd is usually apps/backend; also resolve .env next to compiled output if cwd differs
      envFilePath: [join(process.cwd(), '.env'), join(__dirname, '..', '.env')],
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    EphemerisModule,
    TransitEngineModule,
    RuleEngineModule,
    AiLayerModule,
    NotificationsModule,
    DailyMessageModule,
    JournalModule,
    SchedulerModule,
    EducationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
