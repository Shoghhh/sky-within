import { IsString, IsOptional, IsIn } from 'class-validator';

const MOODS = ['happy', 'calm', 'reflective', 'stressed', 'sad'] as const;

export class CreateJournalEntryDto {
  @IsString()
  text: string;

  @IsOptional()
  @IsIn(MOODS)
  mood?: string;

  @IsOptional()
  date?: string; // YYYY-MM-DD, defaults to today
}
