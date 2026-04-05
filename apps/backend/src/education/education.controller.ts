import { Controller, Get, Query } from '@nestjs/common';
import { AiLayerService } from '../ai-layer/ai-layer.service';

@Controller('education')
export class EducationController {
  constructor(private readonly aiLayer: AiLayerService) {}

  /**
   * Beginner astrology concepts for onboarding / info screens (static JSON).
   * @query lang — `en`, `ru`, or `hy` (also accepts e.g. ru-RU, hy-AM; unknown → en).
   */
  @Get('astrology-basics')
  astrologyBasics(@Query('lang') lang?: string) {
    return this.aiLayer.getAstrologyBasics(lang ?? 'en');
  }
}
