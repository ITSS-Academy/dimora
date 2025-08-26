export class Booking {
  /** ID duy nhất của booking */
  id: string;
  
  /** ID của phòng được book */
  room_id: string;
  
  /** ID của user đã book */
  user_id: string;
  
  /** Ngày check-in */
  check_in_date: Date;
  
  /** Ngày check-out */
  check_out_date: Date;
  
  /** Số lượng khách */
  guest_count: number;
  
  /** Tổng tiền */
  total_amount: number;
  
  /** Trạng thái booking */
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'in_progress' | 'no_show' | 'refunded' | 'disputed';
  
  /** Ghi chú từ user */
  user_notes?: string;
  
  /** Ghi chú từ host */
  host_notes?: string;
  
  /** Thời gian tạo booking */
  created_at: Date;
  
  /** Thời gian cập nhật booking */
  updated_at: Date;
}
