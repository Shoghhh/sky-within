import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  UseGuards,
  Request,
  Query,
  NotFoundException,
  StreamableFile,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { NatalChartDto } from './dto/natal-chart.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async register(@Body() dto: CreateUserDto) {
    return this.userService.create({
      email: dto.email,
      password: dto.password,
      name: dto.name,
      birthDate: dto.birthDate,
      birthTime: dto.birthTime,
      birthPlace: dto.birthPlace,
      birthLatitude: dto.birthLatitude,
      birthLongitude: dto.birthLongitude,
      preferences: dto.preferences,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req: { user: { userId: string } }) {
    return this.userService.findById(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  async updateProfile(
    @Request() req: { user: { userId: string } },
    @Body() dto: UpdateProfileDto,
  ) {
    return this.userService.updateProfile(req.user.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('natal-chart')
  async updateNatalChart(
    @Request() req: { user: { userId: string } },
    @Body() dto: NatalChartDto,
  ) {
    return this.userService.upsertNatalChart(req.user.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('export')
  async exportData(@Request() req: { user: { userId: string } }) {
    return this.userService.exportData(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('reset')
  async resetApp(@Request() req: { user: { userId: string } }) {
    return this.userService.resetApp(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('account')
  async deleteAccount(@Request() req: { user: { userId: string } }) {
    return this.userService.deleteAccount(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('natal-chart/calculate')
  async calculateNatalChart(@Request() req: { user: { userId: string } }) {
    return this.userService.calculateAndSaveNatalChart(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('natal-chart/detail')
  async getNatalChartDetail(
    @Request() req: { user: { userId: string } },
    @Query('refresh') refreshRaw?: string,
    /** Client app language (en | ru | hy); interpretations and cache use this when set. */
    @Query('lang') lang?: string,
  ) {
    const refresh =
      refreshRaw === '1' ||
      refreshRaw === 'true' ||
      refreshRaw === 'yes';
    return this.userService.getNatalChartDetail(req.user.userId, { refresh, language: lang });
  }

  @UseGuards(JwtAuthGuard)
  @Get('natal-chart/chart-image')
  async getNatalChartImage(@Request() req: { user: { userId: string } }) {
    const result = await this.userService.getNatalChartImage(req.user.userId);
    if (!result) throw new NotFoundException('Chart image not available');
    return new StreamableFile(result.body, {
      type: result.contentType,
    });
  }
}
