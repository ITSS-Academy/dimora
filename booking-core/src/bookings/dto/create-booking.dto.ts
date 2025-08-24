import { IsString, IsNumber, IsEnum, IsOptional, Min, IsDateString, IsUUID } from 'class-validator';
import { Booking } from '../entities/booking.entity';

// Define booking status enum
enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
  REFUNDED = 'refunded',
  DISPUTED = 'disputed'
}

export class CreateBookingDto {
  /** ID của phòng được đặt */
  @IsUUID()
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
  @IsUUID()
  user_id?: string;

  /** ID của chủ phòng (sẽ lấy từ room) */
  @IsOptional()
  @IsUUID()
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
