import { IsString, IsNumber, IsEnum, IsOptional, Min, IsDateString } from 'class-validator';
import { BookingStatus } from '../entities/booking.entity';

export class CreateBookingDto {
  /** ID của phòng được đặt */
  @IsString()
  room_id: string;

  /** Ngày check-in */
  @IsDateString()
  check_in_date: string;

  /** Ngày check-out */
  @IsDateString()
  check_out_date: string;

  /** Số lượng khách */
  @IsNumber()
  @Min(1)
  guest_count: number;

  /** Ghi chú từ khách */
  @IsOptional()
  @IsString()
  guest_notes?: string;

  /** ID của khách đặt phòng (sẽ lấy từ auth) */
  @IsOptional()
  @IsString()
  user_id?: string;

  /** ID của chủ phòng (sẽ lấy từ room) */
  @IsOptional()
  @IsString()
  host_id?: string;

  /** Tổng tiền (sẽ tính toán từ room price) */
  @IsOptional()
  @IsNumber()
  total_amount?: number;

  /** Trạng thái booking */
  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;
}
