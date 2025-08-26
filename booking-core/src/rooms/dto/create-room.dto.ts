import { IsString, IsNumber, IsArray, IsBoolean, IsOptional, Min, Max, IsLatitude, IsLongitude } from 'class-validator';

export class CreateRoomDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsNumber()
  @Min(0)
  price_per_night: number;

  @IsString()
  location: string;

  @IsString()
  address: string;

  @IsString()
  city: string;

  @IsString()
  country: string;

  @IsString()
  postal_code: string;

  @IsNumber()
  @IsLatitude()
  latitude: number;

  @IsNumber()
  @IsLongitude()
  longitude: number;

  @IsNumber()
  @Min(1)
  max_guests: number;

  @IsNumber()
  @Min(0)
  bedrooms: number;

  @IsNumber()
  @Min(0)
  bathrooms: number;

  @IsNumber()
  @Min(0)
  beds: number;

  @IsString()
  room_type_id: string;

  @IsArray()
  @IsString({ each: true })
  amenities: string[];

  @IsArray()
  @IsString({ each: true })
  images: string[];

  @IsString()
  host_id: string;
}
