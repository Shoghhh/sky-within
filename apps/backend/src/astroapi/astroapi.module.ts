import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AstroapiService } from './astroapi.service';

@Module({
  imports: [ConfigModule],
  providers: [AstroapiService],
  exports: [AstroapiService],
})
export class AstroapiModule {}
