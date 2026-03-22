import { IsNumber, IsOptional } from 'class-validator';

export class NatalChartDto {
  @IsNumber()
  sun: number;

  @IsNumber()
  moon: number;

  @IsNumber()
  ascendant: number;

  @IsOptional()
  @IsNumber()
  mercury?: number;

  @IsOptional()
  @IsNumber()
  venus?: number;

  @IsOptional()
  @IsNumber()
  mars?: number;

  @IsOptional()
  @IsNumber()
  jupiter?: number;

  @IsOptional()
  @IsNumber()
  saturn?: number;

  @IsOptional()
  @IsNumber()
  uranus?: number;

  @IsOptional()
  @IsNumber()
  neptune?: number;

  @IsOptional()
  @IsNumber()
  pluto?: number;
}
