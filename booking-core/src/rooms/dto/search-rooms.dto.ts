import { IsOptional, IsString, IsNumber, Min, Max, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchRoomsDto {


  @IsOptional()
  @IsString()
  location: string; // Địa chỉ cụ thể hoặc địa điểm

  @IsOptional()
  @IsString()
  checkIn?: string;

  @IsOptional()
  @IsString()
  checkOut?: string;

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

  @IsOptional()
  @IsArray()
  @Type(() => Number)
  amenities?: number[];
}
