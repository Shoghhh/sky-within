import { Controller, Get, Post, Query, UseGuards, Req } from '@nestjs/common';
import { DailyMessageService } from './daily-message.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('daily-message')
export class DailyMessageController {
  constructor(private readonly dailyMessageService: DailyMessageService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getToday(
    @Req() req: { user: { userId: string } },
    @Query('date') dateStr?: string,
  ) {
    const date = dateStr ? new Date(dateStr) : undefined;
    return this.dailyMessageService.getForUser(req.user.userId, date);
  }

  @UseGuards(JwtAuthGuard)
  @Get('transits')
  async getTransits(
    @Req() req: { user: { userId: string } },
    @Query('date') dateStr?: string,
  ) {
    const date = dateStr ? new Date(dateStr) : undefined;
    return this.dailyMessageService.getTransitsForUser(req.user.userId, date);
  }

  @UseGuards(JwtAuthGuard)
  @Post('generate')
  async generate(
    @Req() req: { user: { userId: string } },
    @Query('date') dateStr?: string,
  ) {
    const date = dateStr ? new Date(dateStr) : new Date();
    return this.dailyMessageService.generateForUser(req.user.userId, date);
  }
}
