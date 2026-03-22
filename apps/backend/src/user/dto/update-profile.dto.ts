import { IsString, IsOptional, IsObject, IsNumber } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  birthDate?: string;

  @IsOptional()
  @IsString()
  birthTime?: string;

  @IsOptional()
  @IsString()
  birthPlace?: string;

  @IsOptional()
  @IsNumber()
  birthLatitude?: number;

  @IsOptional()
  @IsNumber()
  birthLongitude?: number;

  @IsOptional()
  @IsObject()
  preferences?: {
    theme?: 'light' | 'dark';
    language?: string;
    notifications?: {
      enabled: boolean;
      time: string;
      type: string;
    };
  };

  @IsOptional()
  @IsString()
  fcmToken?: string;
}
