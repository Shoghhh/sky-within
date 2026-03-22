import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { NatalChartCalculatorModule } from '../natal-chart-calculator/natal-chart-calculator.module';

@Module({
  imports: [PrismaModule, NatalChartCalculatorModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
