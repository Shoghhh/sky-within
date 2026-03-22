import { Module } from '@nestjs/common';
import { EphemerisService } from './ephemeris.service';
import { EphemerisController } from './ephemeris.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [EphemerisController],
  providers: [EphemerisService],
  exports: [EphemerisService],
})
export class EphemerisModule {}
