import { IsString, IsNumber, IsArray, IsOptional, Min, Max, IsBoolean } from 'class-validator';

export class CreateReviewDto {
  /** ID của phòng được review */
  @IsString()
  room_id: string;

  /** ID của booking (để đảm bảo chỉ người đã ở mới review) */
  @IsString()
  booking_id: string;

  /** Điểm đánh giá (1-5 sao) */
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

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
