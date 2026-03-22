import { Module } from '@nestjs/common';
import { AiLayerService } from './ai-layer.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [AiLayerService],
  exports: [AiLayerService],
})
export class AiLayerModule {}
