import { Module } from '@nestjs/common';
import { AiLayerModule } from '../ai-layer/ai-layer.module';
import { EducationController } from './education.controller';

@Module({
  imports: [AiLayerModule],
  controllers: [EducationController],
})
export class EducationModule {}
