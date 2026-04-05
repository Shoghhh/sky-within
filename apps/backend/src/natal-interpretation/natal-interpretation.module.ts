import { Module } from '@nestjs/common';
import { NatalInterpretationService } from './natal-interpretation.service';

@Module({
  providers: [NatalInterpretationService],
  exports: [NatalInterpretationService],
})
export class NatalInterpretationModule {}
