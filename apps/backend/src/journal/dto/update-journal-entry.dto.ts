import { IsString, IsOptional, IsIn } from 'class-validator';

const MOODS = ['happy', 'calm', 'reflective', 'stressed', 'sad'] as const;

export class UpdateJournalEntryDto {
  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  @IsIn(MOODS)
  mood?: string;
}
