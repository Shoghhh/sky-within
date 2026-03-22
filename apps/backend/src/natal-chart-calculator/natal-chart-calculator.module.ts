import { Module } from '@nestjs/common';
import { NatalChartCalculatorService } from './natal-chart-calculator.service';
import { EphemerisModule } from '../ephemeris/ephemeris.module';

@Module({
  imports: [EphemerisModule],
  providers: [NatalChartCalculatorService],
  exports: [NatalChartCalculatorService],
})
export class NatalChartCalculatorModule {}
