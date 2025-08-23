import { IsString, IsNumber, IsBoolean, IsOptional, Min, MaxLength } from 'class-validator';

export class CreateRoomTypeDto {
  /** Tên loại phòng */
  @IsString()
  @MaxLength(100)
  name: string;

  /** Mô tả chi tiết về loại phòng */
  @IsString()
  @MaxLength(500)
  description: string;

  /** Icon hoặc emoji đại diện cho loại phòng */
  @IsString()
  @MaxLength(10)
  icon: string;

}
