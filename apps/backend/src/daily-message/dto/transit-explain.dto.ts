import { IsIn, IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';

export class TransitExplainDto {
  @IsString()
  planet!: string;

  @IsString()
  target!: string;

  @IsString()
  aspect!: string;

  @IsNumber()
  @Min(0)
  @Max(10)
  orb!: number;

  /** Only strong (tight-orb) rows request an explanation. */
  @IsIn(['high'])
  intensity!: 'high';

  @IsOptional()
  @IsString()
  language?: string;
}
