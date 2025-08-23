export class Booking {
  /** ID duy nhất của booking */
  id: string;
  
  /** ID của phòng được đặt */
  room_id: string;
  
  /** ID của khách đặt phòng */
  user_id: string;
  
  /** ID của chủ phòng */
  host_id: string;
  
  /** Ngày check-in (ISO string format) */
  check_in_date: string;
  
  /** Ngày check-out (ISO string format) */
  check_out_date: string;
  
  /** Số lượng khách */
  guest_count: number;
  
  /** Tổng tiền */
  total_amount: number;
  
  /** Trạng thái booking (pending, confirmed, cancelled, completed) */
  status: BookingStatus;
  
  /** Ghi chú từ khách */
  guest_notes: string;
  
  /** Ghi chú từ host */
  host_notes: string;
  
  /** Thời gian tạo booking */
  created_at: Date;
  
  /** Thời gian cập nhật booking */
  updated_at: Date;
}

/** Enum định nghĩa các trạng thái booking */
export enum BookingStatus {
  /** Chờ xác nhận */
  PENDING = 'pending',
  
  /** Đã xác nhận */
  CONFIRMED = 'confirmed',
  
  /** Đã hủy */
  CANCELLED = 'cancelled',
  
  /** Đã hoàn thành */
  COMPLETED = 'completed',
}
