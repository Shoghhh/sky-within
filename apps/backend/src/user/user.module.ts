import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { NatalChartCalculatorModule } from '../natal-chart-calculator/natal-chart-calculator.module';
import { NatalChartDetailModule } from '../natal-chart-detail/natal-chart-detail.module';
import { AstroapiModule } from '../astroapi/astroapi.module';
import { NatalInterpretationModule } from '../natal-interpretation/natal-interpretation.module';
import { AiLayerModule } from '../ai-layer/ai-layer.module';

@Module({
  imports: [
    PrismaModule,
    NatalChartCalculatorModule,
    NatalChartDetailModule,
    AstroapiModule,
    NatalInterpretationModule,
    AiLayerModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
