export class Review {
  /** ID duy nhất của review */
  id: string;

  /** ID của phòng được review */
  room_id: string;

  /** ID của người viết review */
  user_id: string;

  /** ID của booking (để đảm bảo chỉ người đã ở mới review) *
  
  /** Điểm đánh giá (1-5 sao) */

  /** Nội dung review */
  comment: string;

  /** Danh sách ảnh đính kèm (nếu có) */
  images: string[];

  /** Thời gian tạo review */
  created_at: Date;

  /** Thời gian cập nhật review */
  updated_at: Date;
}

/** Enum định nghĩa các loại rating */
export enum RatingType {
  /** Rất tệ */
  VERY_POOR = 1,

  /** Tệ */
  POOR = 2,

  /** Bình thường */
  AVERAGE = 3,

  /** Tốt */
  GOOD = 4,

  /** Rất tốt */
  EXCELLENT = 5,
}
