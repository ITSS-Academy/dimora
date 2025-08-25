export interface AuthModel   {
  id: string;

  /** Email đăng nhập (unique) */
  email: string;

  /** Họ tên đầy đủ */
  full_name: string;

  /** Số điện thoại */
  phone?: string;

  /** URL ảnh đại diện */
  avatar_url?: string;

  /** Google ID */
  google_id: string;

  /** Thời gian tạo */
  created_at: string;

  /** Thời gian cập nhật */
  updated_at: string;
}
