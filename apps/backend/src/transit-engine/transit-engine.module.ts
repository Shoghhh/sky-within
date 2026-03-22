import { Module } from '@nestjs/common';
import { TransitEngineService } from './transit-engine.service';
import { EphemerisModule } from '../ephemeris/ephemeris.module';

@Module({
  imports: [EphemerisModule],
  providers: [TransitEngineService],
  exports: [TransitEngineService],
})
export class TransitEngineModule {}
