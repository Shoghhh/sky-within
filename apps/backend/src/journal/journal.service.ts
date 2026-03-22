import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JournalService {
  constructor(private prisma: PrismaService) {}

  async create(
    userId: string,
    data: { text: string; mood?: string; date?: string },
  ) {
    const date = data.date
      ? new Date(data.date)
      : new Date(new Date().toISOString().split('T')[0]);
    const dateOnly = new Date(date.toISOString().split('T')[0]);

    return this.prisma.journalEntry.upsert({
      where: { userId_date: { userId, date: dateOnly } },
      create: {
        userId,
        date: dateOnly,
        text: data.text,
        mood: data.mood ?? null,
      },
      update: { text: data.text, mood: data.mood ?? undefined },
    });
  }

  async getForDate(userId: string, dateStr?: string) {
    const date = dateStr
      ? new Date(dateStr)
      : new Date(new Date().toISOString().split('T')[0]);
    const dateOnly = new Date(date.toISOString().split('T')[0]);

    const entry = await this.prisma.journalEntry.findUnique({
      where: { userId_date: { userId, date: dateOnly } },
    });
    return entry;
  }

  async list(userId: string, limit = 30) {
    return this.prisma.journalEntry.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: limit,
    });
  }

  async update(
    userId: string,
    dateStr: string,
    data: { text?: string; mood?: string },
  ) {
    const dateOnly = new Date(new Date(dateStr).toISOString().split('T')[0]);
    const existing = await this.prisma.journalEntry.findUnique({
      where: { userId_date: { userId, date: dateOnly } },
    });
    if (!existing) {
      throw new NotFoundException('Journal entry not found');
    }
    return this.prisma.journalEntry.update({
      where: { userId_date: { userId, date: dateOnly } },
      data: { ...data, updatedAt: new Date() },
    });
  }

  async delete(userId: string, dateStr: string) {
    const dateOnly = new Date(new Date(dateStr).toISOString().split('T')[0]);
    await this.prisma.journalEntry.deleteMany({
      where: { userId, date: dateOnly },
    });
    return { success: true };
  }
}
