import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import type { RuleResult } from '../rule-engine/rule-engine.service';

@Injectable()
export class AiLayerService {
  private openai: OpenAI | null = null;

  constructor(private config: ConfigService) {
    const apiKey = this.config.get<string>('OPENAI_API_KEY');
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
    }
  }

  async generateMessage(
    userName: string,
    ruleResult: RuleResult,
    language: string = 'en',
  ): Promise<string> {
    if (!this.openai) {
      return this.fallbackMessage(userName, ruleResult);
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: this.config.get<string>('OPENAI_MODEL') ?? 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a gentle astrology adviser. Generate ONE short, personalized daily message (1-2 sentences) based on structured interpretation data. Do not invent data—only format the given interpretation into warm, human-readable advice. Keep it minimalist and uplifting.`,
          },
          {
            role: 'user',
            content: `User name: ${userName}
Structured interpretation:
- Dominant layer: ${ruleResult.dominantLayer}
- Intensity: ${ruleResult.intensity}
- Advice type: ${ruleResult.adviceType}
- Tone: ${ruleResult.tone}

Generate a 1-2 sentence daily message in ${language}.`,
          },
        ],
        max_tokens: 100,
        temperature: 0.7,
      });

      const text = response.choices[0]?.message?.content?.trim();
      return text ?? this.fallbackMessage(userName, ruleResult);
    } catch {
      return this.fallbackMessage(userName, ruleResult);
    }
  }

  private fallbackMessage(userName: string, ruleResult: RuleResult): string {
    return `${userName}, today's ${ruleResult.dominantLayer} energy is ${ruleResult.intensity}. Take time to ${ruleResult.adviceType} with a ${ruleResult.tone} approach.`;
  }
}
