import { Amenity } from "./amenity.entity";
export class Room {
  /** ID duy nhất của phòng */
  id: string;
  
  /** Tiêu đề của phòng (tên hiển thị) */
  title: string;
  
  /** Mô tả chi tiết về phòng */
  description: string;
  
  /** Giá tiền cho một đêm (đơn vị tiền tệ) */
  price_per_night: number;
  
  /** Vị trí tổng quát (ví dụ: "Quận 1, TP.HCM") */
  location: string;
  
  /** Địa chỉ chi tiết của phòng */
  address: string;
  
  /** Tên thành phố */
  city: string;
  
  /** Tên quốc gia */
  country: string;
  
  /** Vĩ độ (latitude) - để hiển thị trên Google Maps */
  latitude: number;
  
  /** Kinh độ (longitude) - để hiển thị trên Google Maps */
  longitude: number;
  
  /** Mã bưu điện */
  postal_code: number;
  
  /** Số lượng khách tối đa có thể ở */
  max_guests: number;
  
  /** Số phòng ngủ */
  bedrooms: number;
  
  /** Số phòng tắm */
  bathrooms: number;
  
  /** Số giường */
  beds: number;
  
  /** ID của loại phòng (reference đến bảng room_types) */
  room_type_id: string;
  
  /** Danh sách tiện nghi có sẵn với thông tin chi tiết */
  amenities: Amenity[];
  
  /** Danh sách URL hình ảnh của phòng */
  images: string[];
  
  /** ID của chủ phòng (người sở hữu) */
  host_id: string;
  
  /** Trạng thái có sẵn để đặt phòng hay không */
  is_available: boolean;
  
  /** Thời gian tạo phòng */
  created_at: Date;
  
  /** Thời gian cập nhật thông tin phòng lần cuối */
  updated_at: Date;
}





