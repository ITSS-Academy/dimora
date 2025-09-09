import {
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  Min,
  Max,
  IsBoolean,
} from 'class-validator';

export class CreateReviewDto {
  /** ID của phòng được review */
  @IsString()
  room_id: string;

  /** Điểm đánh giá (1-5 sao) */

  /** Nội dung review */
  @IsString()
  comment: string;

  /** Danh sách ảnh đính kèm (nếu có) */
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  /** ID của người viết review (sẽ lấy từ auth) */
  @IsOptional()
  @IsString()
  user_id?: string;
}
