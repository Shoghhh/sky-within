import { Controller, Get, Query } from '@nestjs/common';
import { EphemerisService } from './ephemeris.service';

@Controller('ephemeris')
export class EphemerisController {
  constructor(private readonly ephemerisService: EphemerisService) {}

  @Get('positions')
  async getPositions(@Query('date') dateStr?: string) {
    const date = dateStr ? new Date(dateStr) : new Date();
    return this.ephemerisService.getPositionsForDate(date);
  }
}
