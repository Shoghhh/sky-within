import { Module } from '@nestjs/common';
import { RuleEngineService } from './rule-engine.service';
import { TransitEngineModule } from '../transit-engine/transit-engine.module';

@Module({
  imports: [TransitEngineModule],
  providers: [RuleEngineService],
  exports: [RuleEngineService],
})
export class RuleEngineModule {}
