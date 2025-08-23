export class RoomType {
  /** ID duy nhất của loại phòng */
  id: string;
  
  /** Tên loại phòng (ví dụ: "Toàn bộ nơi", "Phòng riêng") */
  name: string;
  
  /** Mô tả chi tiết về loại phòng */
  description: string;
  
  /** Icon hoặc emoji đại diện cho loại phòng */
  icon: string;
  
  /** Thời gian tạo */
  created_at: Date;
  
  /** Thời gian cập nhật */
  updated_at: Date;
}
