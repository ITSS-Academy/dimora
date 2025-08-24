export class User {
  /** UUID của user */
  id: string;

  /** Email đăng nhập (unique) */
  email: string;

  /** Họ tên đầy đủ */
  full_name: string;

  /** Số điện thoại */
  phone?: string;

  /** URL ảnh đại diện */
  avatar_url?: string;

  /** Thời gian tạo */
  created_at: Date;

  /** Thời gian cập nhật */
  updated_at: Date;
}
