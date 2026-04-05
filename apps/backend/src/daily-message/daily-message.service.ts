import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EphemerisService } from '../ephemeris/ephemeris.service';
import { TransitEngineService } from '../transit-engine/transit-engine.service';
import { RuleEngineService } from '../rule-engine/rule-engine.service';
import { AiLayerService } from '../ai-layer/ai-layer.service';
import { NotificationsService } from '../notifications/notifications.service';
import type { RuleResult } from '../rule-engine/rule-engine.service';
import type { TransitAspect } from '../transit-engine/transit-engine.service';
import type { TransitExplainDto } from './dto/transit-explain.dto';

@Injectable()
export class DailyMessageService {
  constructor(
    private prisma: PrismaService,
    private ephemeris: EphemerisService,
    private transitEngine: TransitEngineService,
    private ruleEngine: RuleEngineService,
    private aiLayer: AiLayerService,
    private notifications: NotificationsService,
  ) {}

  async generateForUser(userId: string, date: Date) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { natalChart: true },
    });

    if (!user?.natalChart) {
      throw new NotFoundException('User or natal chart not found');
    }

    const natalChart: Record<string, number> = {
      sun: user.natalChart.sun,
      moon: user.natalChart.moon,
      ascendant: user.natalChart.ascendant,
      mercury: user.natalChart.mercury ?? 0,
      venus: user.natalChart.venus ?? 0,
      mars: user.natalChart.mars ?? 0,
      jupiter: user.natalChart.jupiter ?? 0,
      saturn: user.natalChart.saturn ?? 0,
      uranus: user.natalChart.uranus ?? 0,
      neptune: user.natalChart.neptune ?? 0,
      pluto: user.natalChart.pluto ?? 0,
    };

    const positions = await this.ephemeris.getPositionsForDate(date);
    const transits: TransitAspect[] =
      this.transitEngine.calculateTransits(positions, natalChart);
    const ruleResult: RuleResult = this.ruleEngine.interpret(transits);

    const prefs = user.preferences as {
      language?: string;
      notifications?: { enabled?: boolean; time?: string };
    } | null;
    const language = prefs?.language ?? 'en';

    const message = await this.aiLayer.generateMessage(
      user.name,
      ruleResult,
      language,
    );

    const dateOnly = new Date(date.toISOString().split('T')[0]);

    const dailyMessage = await this.prisma.dailyMessage.upsert({
      where: {
        userId_date: { userId, date: dateOnly },
      },
      create: {
        userId,
        date: dateOnly,
        message,
        dominantLayer: ruleResult.dominantLayer,
        intensity: ruleResult.intensity,
        adviceType: ruleResult.adviceType,
        tone: ruleResult.tone,
        ruleResult: ruleResult as object,
        transitData: transits as unknown as object,
      },
      update: {
        message,
        dominantLayer: ruleResult.dominantLayer,
        intensity: ruleResult.intensity,
        adviceType: ruleResult.adviceType,
        tone: ruleResult.tone,
        ruleResult: ruleResult as object,
        transitData: transits as unknown as object,
      },
    });

    if (
      prefs?.notifications?.enabled &&
      user.fcmToken &&
      !dailyMessage.sentAt
    ) {
      await this.notifications.sendDailyMessage(user.fcmToken, message);
      await this.prisma.dailyMessage.update({
        where: { id: dailyMessage.id },
        data: { sentAt: new Date() },
      });
    }

    return dailyMessage;
  }

  async getForUser(userId: string, date?: Date, refresh = false) {
    const dateOnly = date
      ? new Date(date.toISOString().split('T')[0])
      : new Date(new Date().toISOString().split('T')[0]);

    if (refresh) {
      return this.generateForUser(userId, dateOnly);
    }

    let msg = await this.prisma.dailyMessage.findUnique({
      where: {
        userId_date: { userId, date: dateOnly },
      },
    });

    if (!msg) {
      msg = await this.generateForUser(userId, dateOnly);
    }

    return msg;
  }

  async getTransitsForUser(userId: string, date?: Date) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { natalChart: true },
    });

    if (!user?.natalChart) {
      throw new NotFoundException('User or natal chart not found');
    }

    const natalChart: Record<string, number> = {
      sun: user.natalChart.sun,
      moon: user.natalChart.moon,
      ascendant: user.natalChart.ascendant,
      mercury: user.natalChart.mercury ?? 0,
      venus: user.natalChart.venus ?? 0,
      mars: user.natalChart.mars ?? 0,
      jupiter: user.natalChart.jupiter ?? 0,
      saturn: user.natalChart.saturn ?? 0,
      uranus: user.natalChart.uranus ?? 0,
      neptune: user.natalChart.neptune ?? 0,
      pluto: user.natalChart.pluto ?? 0,
    };

    const d = date ?? new Date();
    const transits = await this.transitEngine.getTransitsForUser(natalChart, d);
    return this.ruleEngine.sortTransitsByPriority(transits);
  }

  /** AI paragraph for one strong transit; client falls back to template if unavailable. */
  async explainTransit(_userId: string, dto: TransitExplainDto) {
    const language = dto.language?.trim() || 'en';
    return this.aiLayer.explainStrongTransit(
      {
        planet: dto.planet,
        target: dto.target,
        aspect: dto.aspect,
        orb: dto.orb,
        intensity: dto.intensity,
      },
      language,
    );
  }
}
