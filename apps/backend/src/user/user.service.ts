import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NatalChartCalculatorService } from '../natal-chart-calculator/natal-chart-calculator.service';
import { NatalChartDetailService } from '../natal-chart-detail/natal-chart-detail.service';
import { NatalPriorityService } from '../natal-chart-detail/natal-priority.service';
import { AstroapiService } from '../astroapi/astroapi.service';
import { NatalInterpretationService } from '../natal-interpretation/natal-interpretation.service';
import { AiLayerService } from '../ai-layer/ai-layer.service';
import * as bcrypt from 'bcrypt';
import type { NatalChartDto } from './dto/natal-chart.dto';
import type { UpdateProfileDto } from './dto/update-profile.dto';
import type { NatalChartDetail } from '../natal-chart-detail/natal-chart-detail.service';
import type { NatalInterpretationPatch } from '../ai-layer/ai-layer.service';
import { computeNatalChartInputHash } from './natal-interpretation-input-hash';
import type { NatalChart, Prisma, User } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private natalChartCalculator: NatalChartCalculatorService,
    private natalChartDetail: NatalChartDetailService,
    private astroapi: AstroapiService,
    private natalInterpretation: NatalInterpretationService,
    private aiLayer: AiLayerService,
    private natalPriority: NatalPriorityService,
  ) {}

  async create(data: {
    email: string;
    password: string;
    name: string;
    birthDate: string;
    birthTime: string;
    birthPlace: string;
    birthLatitude?: number;
    birthLongitude?: number;
    preferences?: object;
  }) {
    const existing = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const birthDate = new Date(data.birthDate);

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        birthDate,
        birthTime: data.birthTime,
        birthPlace: data.birthPlace,
        birthLatitude: data.birthLatitude,
        birthLongitude: data.birthLongitude,
        preferences: data.preferences ?? {},
      },
      select: {
        id: true,
        email: true,
        name: true,
        birthDate: true,
        birthTime: true,
        birthPlace: true,
        preferences: true,
        createdAt: true,
      },
    });

    try {
      await this.calculateAndSaveNatalChart(user.id);
    } catch {
      // Ignore if natal chart calculation fails (e.g. invalid date/time format)
    }

    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: { natalChart: true },
    });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { natalChart: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      birthDate: user.birthDate,
      birthTime: user.birthTime,
      birthPlace: user.birthPlace,
      preferences: user.preferences,
      fcmToken: user.fcmToken,
      natalChart: user.natalChart,
    };
  }

  /**
   * Natal detail: rule-based enrich is always computed; OpenAI runs only when OPENAI_API_KEY is set and
   * (no cache, fingerprint changed, or client ?refresh=1). Cached rows store OpenAI prose in DB.
   */
  async getNatalChartDetail(
    userId: string,
    options?: { refresh?: boolean; language?: string },
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { natalChart: true },
    });

    if (!user || !user.natalChart) {
      throw new NotFoundException('User or natal chart not found');
    }

    const userWithChart = user as User & { natalChart: NatalChart };

    const prefs = user.preferences as { language?: string } | null;
    const allowed = new Set(['en', 'ru', 'hy']);
    const q = options?.language?.trim().toLowerCase();
    const lang =
      q && allowed.has(q) ? q : (prefs?.language ?? 'en');

    const lat = user.birthLatitude;
    const lon = user.birthLongitude;

    // --- Chart geometry: AstroAPI vs local (DB) fallback ---
    // AstroAPI path (below): Placidus houses, full point set from api.astroapi.cloud, chartImageUrl set.
    // Success signals in JSON: houseSystem "placidus", optional chartImageUrl, nodes/Lilith etc. if API returns them.
    // If ASTROAPI_KEY is missing, lat/lon null, or calculateNatal returns null (see AstroapiService logs), we skip to buildDetail().
    // Local fallback: equal houses from ascendant + longitudes in Prisma — houseSystem "equal", classic planets only from DB.

    let detail: NatalChartDetail;

    if (this.astroapi.isAvailable() && lat != null && lon != null) {
      const tz = this.astroapi.getTimezone(lat, lon);
      const birthDate = user.birthDate;
      const [h, m] = (user.birthTime || '12:00').split(':').map(Number);
      const dt = new Date(birthDate);
      dt.setHours(h, m ?? 0, 0, 0);
      const dateTime = dt.toISOString().slice(0, 16);

      const astroRes = await this.astroapi.calculateNatal({
        dateTime,
        latitude: lat,
        longitude: lon,
        timezone: tz,
        houseSystem: 'placidus',
        language: 'en',
        includeText: true,
      });

      if (astroRes) {
        const birthDateStr = birthDate.toISOString().split('T')[0];
        const chartImageUrl = '/user/natal-chart/chart-image';

        detail = this.natalChartDetail.buildDetailFromAstroapi(
          astroRes,
          birthDateStr,
          user.birthTime,
          user.birthPlace,
          lat,
          lon,
          tz,
          chartImageUrl,
        );
      } else {
        detail = this.buildLocalNatalChartDetail(userWithChart);
      }
    } else {
      detail = this.buildLocalNatalChartDetail(userWithChart);
    }

    const structuredInterpretation = this.natalInterpretation.buildStructured(detail);
    let enriched = this.natalInterpretation.enrichDetailWithInterpretations(
      detail,
      structuredInterpretation,
    );

    const chartInputHash = computeNatalChartInputHash(userWithChart, detail);
    const useOpenAi = this.aiLayer.isOpenAiConfigured();

    if (useOpenAi && !options?.refresh) {
      const cache = await this.prisma.natalInterpretationCache.findUnique({
        where: {
          userId_chartInputHash_language: {
            userId,
            chartInputHash,
            language: lang,
          },
        },
      });
      if (cache) {
        const merged = this.aiLayer.applyNatalInterpretationPatch(
          enriched,
          cache.openAiPatch as unknown as NatalInterpretationPatch,
        );
        return {
          ...merged,
          structuredInterpretation,
          personalityProse: cache.personalityProse,
          layout: this.natalPriority.buildLayout(merged),
        };
      }
    }

    if (useOpenAi) {
      enriched = await this.aiLayer.enrichNatalChartDetailWithOpenAI(enriched, lang);
      const personalityProse = await this.aiLayer.formatNatalInterpretation(
        enriched,
        structuredInterpretation,
        lang,
      );
      const openAiPatch = this.aiLayer.extractNatalInterpretationPatch(enriched);
      await this.prisma.natalInterpretationCache.upsert({
        where: {
          userId_chartInputHash_language: {
            userId,
            chartInputHash,
            language: lang,
          },
        },
        create: {
          userId,
          chartInputHash,
          language: lang,
          personalityProse,
          openAiPatch: openAiPatch as unknown as Prisma.InputJsonValue,
        },
        update: {
          personalityProse,
          openAiPatch: openAiPatch as unknown as Prisma.InputJsonValue,
        },
      });
      return {
        ...enriched,
        structuredInterpretation,
        personalityProse,
        layout: this.natalPriority.buildLayout(enriched),
      };
    }

    const personalityProse = await this.aiLayer.formatNatalInterpretation(
      enriched,
      structuredInterpretation,
      lang,
    );
    return {
      ...enriched,
      structuredInterpretation,
      personalityProse,
      layout: this.natalPriority.buildLayout(enriched),
    };
  }

  private buildLocalNatalChartDetail(user: User & { natalChart: NatalChart }): NatalChartDetail {
    const chart = user.natalChart;
    return this.natalChartDetail.buildDetail(
      user.birthDate,
      user.birthTime,
      user.birthPlace,
      user.birthLatitude,
      user.birthLongitude,
      {
        sun: chart.sun,
        moon: chart.moon,
        ascendant: chart.ascendant,
        mercury: chart.mercury,
        venus: chart.venus,
        mars: chart.mars,
        jupiter: chart.jupiter,
        saturn: chart.saturn,
        uranus: chart.uranus,
        neptune: chart.neptune,
        pluto: chart.pluto,
      },
    );
  }

  async getNatalChartImage(userId: string): Promise<{ contentType: string; body: Buffer } | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user || !user.birthLatitude || !user.birthLongitude || !this.astroapi.isAvailable()) {
      return null;
    }
    const tz = this.astroapi.getTimezone(user.birthLatitude, user.birthLongitude);
    const [h, m] = (user.birthTime || '12:00').split(':').map(Number);
    const dt = new Date(user.birthDate);
    dt.setHours(h, m ?? 0, 0, 0);
    const dateTime = dt.toISOString().slice(0, 16);
    const url = this.astroapi.getChartImageUrl({
      dateTime,
      latitude: user.birthLatitude,
      longitude: user.birthLongitude,
      timezone: tz,
      width: 800,
      height: 800,
    });
    if (!url) return null;
    return this.astroapi.fetchChartImage(url);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const data: Record<string, unknown> = {};

    if (dto.name !== undefined) data.name = dto.name;
    if (dto.birthDate !== undefined) data.birthDate = new Date(dto.birthDate);
    if (dto.birthTime !== undefined) data.birthTime = dto.birthTime;
    if (dto.birthPlace !== undefined) data.birthPlace = dto.birthPlace;
    if (dto.birthLatitude !== undefined) data.birthLatitude = dto.birthLatitude;
    if (dto.birthLongitude !== undefined) data.birthLongitude = dto.birthLongitude;
    if (dto.preferences !== undefined) data.preferences = dto.preferences;
    if (dto.fcmToken !== undefined) data.fcmToken = dto.fcmToken;

    const birthFieldsUpdated =
      dto.birthDate !== undefined ||
      dto.birthTime !== undefined ||
      dto.birthPlace !== undefined ||
      dto.birthLatitude !== undefined ||
      dto.birthLongitude !== undefined;

    const user = await this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        birthDate: true,
        birthTime: true,
        birthPlace: true,
        preferences: true,
        fcmToken: true,
      },
    });

    if (birthFieldsUpdated) {
      try {
        await this.calculateAndSaveNatalChart(userId);
      } catch {
        // Natal chart calculation may fail (e.g. invalid date); don't fail the profile update
      }
    }

    return user;
  }

  async upsertNatalChart(userId: string, chart: NatalChartDto) {
    return this.prisma.natalChart.upsert({
      where: { userId },
      create: {
        userId,
        sun: chart.sun,
        moon: chart.moon,
        ascendant: chart.ascendant,
        mercury: chart.mercury,
        venus: chart.venus,
        mars: chart.mars,
        jupiter: chart.jupiter,
        saturn: chart.saturn,
        uranus: chart.uranus,
        neptune: chart.neptune,
        pluto: chart.pluto,
      },
      update: {
        sun: chart.sun,
        moon: chart.moon,
        ascendant: chart.ascendant,
        mercury: chart.mercury,
        venus: chart.venus,
        mars: chart.mars,
        jupiter: chart.jupiter,
        saturn: chart.saturn,
        uranus: chart.uranus,
        neptune: chart.neptune,
        pluto: chart.pluto,
      },
    });
  }

  async getAllUsersWithNatalCharts() {
    return this.prisma.user.findMany({
      where: { natalChart: { isNot: null } },
      include: { natalChart: true },
    });
  }

  async validatePassword(userId: string, password: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });
    if (!user) return false;
    return bcrypt.compare(password, user.password);
  }

  async exportData(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        natalChart: true,
        dailyMessages: {
          orderBy: { date: 'desc' },
          take: 365,
        },
        journalEntries: {
          orderBy: { date: 'desc' },
          take: 365,
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { password: _, ...safeUser } = user;
    return {
      exportedAt: new Date().toISOString(),
      profile: {
        id: safeUser.id,
        email: safeUser.email,
        name: safeUser.name,
        birthDate: safeUser.birthDate,
        birthTime: safeUser.birthTime,
        birthPlace: safeUser.birthPlace,
        preferences: safeUser.preferences,
        createdAt: safeUser.createdAt,
      },
      natalChart: safeUser.natalChart,
      dailyMessages: safeUser.dailyMessages.map((m: { date: Date; message: string; dominantLayer: string; intensity: string; adviceType: string; tone: string }) => ({
        date: m.date,
        message: m.message,
        dominantLayer: m.dominantLayer,
        intensity: m.intensity,
        adviceType: m.adviceType,
        tone: m.tone,
      })),
      journalEntries: safeUser.journalEntries.map((e: { date: Date; text: string; mood: string | null }) => ({
        date: e.date,
        text: e.text,
        mood: e.mood,
      })),
    };
  }

  async resetApp(userId: string) {
    await this.prisma.$transaction([
      this.prisma.dailyMessage.deleteMany({ where: { userId } }),
      this.prisma.journalEntry.deleteMany({ where: { userId } }),
      this.prisma.natalChart.deleteMany({ where: { userId } }),
      this.prisma.user.update({
        where: { id: userId },
        data: {
          preferences: {},
          fcmToken: null,
        },
      }),
    ]);
    return { message: 'App data reset successfully' };
  }

  async deleteAccount(userId: string) {
    await this.prisma.user.delete({
      where: { id: userId },
    });
    return { message: 'Account deleted successfully' };
  }

  async calculateAndSaveNatalChart(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const birthDateStr = user.birthDate.toISOString().split('T')[0];
    const chart = this.natalChartCalculator.calculate(
      birthDateStr,
      user.birthTime,
      user.birthLatitude ?? undefined,
      user.birthLongitude ?? undefined,
    );

    return this.upsertNatalChart(userId, chart);
  }
}
