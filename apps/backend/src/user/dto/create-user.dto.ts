import { IsEmail, IsString, IsOptional, MinLength, IsNumber } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  name: string;

  @IsString()
  birthDate: string; // "1998-06-15"

  @IsString()
  birthTime: string; // "14:30"

  @IsString()
  birthPlace: string;

  @IsOptional()
  @IsNumber()
  birthLatitude?: number;

  @IsOptional()
  @IsNumber()
  birthLongitude?: number;

  @IsOptional()
  preferences?: {
    theme?: 'light' | 'dark';
    language?: string;
    notifications?: {
      enabled: boolean;
      time: string;
      type: string;
    };
  };
}
