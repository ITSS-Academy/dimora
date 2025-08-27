import { IsOptional, IsString, IsNumber, Min, Max, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchRoomsDto {


  @IsOptional()
  @IsString()
  location: string; // Địa chỉ cụ thể hoặc địa điểm

  @IsOptional()
  @IsString()
  @IsDateString()
  checkIn?: string; // Format: YYYY-MM-DD

  @IsOptional()
  @IsString()
  @IsDateString()
  checkOut?: string; // Format: YYYY-MM-DD

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  guests?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.1)
  @Max(100)
  radius?: number; // radius in kilometers, default: 10

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;
}
