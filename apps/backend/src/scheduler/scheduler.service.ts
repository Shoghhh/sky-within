import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DailyMessageService } from '../daily-message/daily-message.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private dailyMessageService: DailyMessageService,
    private prisma: PrismaService,
  ) {}

  @Cron('0 6 * * *', { timeZone: 'UTC' })
  async generateDailyMessages() {
    this.logger.log('Starting daily message generation for all users.');

    const users = await this.prisma.user.findMany({
      where: { natalChart: { isNot: null } },
      select: { id: true },
    });

    const today = new Date();
    let success = 0;
    let failed = 0;

    for (const user of users) {
      try {
        await this.dailyMessageService.generateForUser(user.id, today);
        success++;
      } catch (err) {
        this.logger.error(`Failed for user ${user.id}:`, err);
        failed++;
      }
    }

    this.logger.log(
      `Daily messages: ${success} generated, ${failed} failed.`,
    );
  }
}
