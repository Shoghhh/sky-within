import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JournalService } from './journal.service';
import { CreateJournalEntryDto } from './dto/create-journal-entry.dto';
import { UpdateJournalEntryDto } from './dto/update-journal-entry.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('journal')
@UseGuards(JwtAuthGuard)
export class JournalController {
  constructor(private readonly journalService: JournalService) {}

  @Post()
  async create(
    @Req() req: { user: { userId: string } },
    @Body() dto: CreateJournalEntryDto,
  ) {
    return this.journalService.create(req.user.userId, {
      text: dto.text,
      mood: dto.mood,
      date: dto.date,
    });
  }

  @Get()
  async getForDate(
    @Req() req: { user: { userId: string } },
    @Query('date') date?: string,
  ) {
    return this.journalService.getForDate(req.user.userId, date);
  }

  @Get('entries')
  async list(
    @Req() req: { user: { userId: string } },
    @Query('limit') limit?: string,
  ) {
    return this.journalService.list(
      req.user.userId,
      limit ? parseInt(limit, 10) : undefined,
    );
  }

  @Patch()
  async update(
    @Req() req: { user: { userId: string } },
    @Query('date') date: string,
    @Body() dto: UpdateJournalEntryDto,
  ) {
    return this.journalService.update(req.user.userId, date, dto);
  }

  @Delete()
  async delete(
    @Req() req: { user: { userId: string } },
    @Query('date') date: string,
  ) {
    return this.journalService.delete(req.user.userId, date);
  }
}
