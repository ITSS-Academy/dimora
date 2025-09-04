export class Amenity {
  /** ID duy nhất của tiện nghi */
  id: number;
  
  /** Tên tiện nghi (ví dụ: "WiFi", "Điều hòa", "Tủ lạnh") */
  name: string;
  
  /** Tên icon để hiển thị (ví dụ: "wifi", "air-conditioning", "refrigerator") */
  icon_name: string;
  
  /** Thời gian tạo */
  created_at: Date;
}
