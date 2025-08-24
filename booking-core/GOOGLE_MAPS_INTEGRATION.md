# Tích hợp Google Maps với Booking Core

## Tổng quan

Booking Core đã được tích hợp với Google Maps để hỗ trợ:
- Lưu trữ tọa độ địa lý (latitude/longitude) cho mỗi phòng dưới dạng string
- Tìm kiếm phòng theo vị trí địa lý (radius search)
- Tự động lấy tọa độ từ địa chỉ (geocoding)

## Cấu hình

### 1. Google Maps API Key

Thêm API key vào file `.env`:

```env
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### 2. Các API cần bật trong Google Cloud Console

- **Geocoding API**: Để chuyển đổi địa chỉ thành tọa độ
- **Maps JavaScript API**: Để hiển thị bản đồ (frontend)
- **Places API**: Để tìm kiếm địa điểm (tùy chọn)

## Cấu trúc dữ liệu

### Room Entity

Room entity đã được cập nhật với các trường mới:

```typescript
export class Room {
  // ... các trường khác
  
  /** Vĩ độ (latitude) - để hiển thị trên Google Maps */
  latitude: string;
  
  /** Kinh độ (longitude) - để hiển thị trên Google Maps */
  longitude: string;
  
  // ... các trường khác
}
```

**Lưu ý**: Tọa độ được lưu dưới dạng `string` để đảm bảo độ chính xác và tránh mất mát dữ liệu.

## API Endpoints

### 1. Tạo phòng (có thể có hoặc không có hình ảnh)

```http
POST /rooms
Content-Type: multipart/form-data

Form Data:
- title: "Phòng đẹp ở Quận 1"
- description: "Phòng view đẹp, gần trung tâm"
- price_per_night: 500000
- address: "123 Nguyễn Huệ"
- city: "TP.HCM"
- country: "Việt Nam"
- max_guests: 2
- bedrooms: 1
- bathrooms: 1
- beds: 1
- room_type_id: "room-type-id"
- amenities: ["WiFi", "Điều hòa"]
- host_id: "host-id"
- images: [file1.jpg, file2.jpg, file3.jpg] (tùy chọn, tối đa 10 file, mỗi file tối đa 5MB)

// Nếu có images: Hình ảnh sẽ được lưu vào Supabase Storage với cấu trúc: room/{hostId}/{roomId}/{1.jpg, 2.jpg, ...}
// Nếu không có images: Chỉ tạo room với thông tin cơ bản
// latitude và longitude sẽ được tự động lấy từ địa chỉ
```

### 2. Cập nhật phòng (có thể có hoặc không có hình ảnh)

```http
PATCH /rooms/{roomId}
Content-Type: multipart/form-data

Form Data:
- title: "Phòng đẹp ở Quận 1" (tùy chọn)
- description: "Phòng view đẹp, gần trung tâm" (tùy chọn)
- price_per_night: 500000 (tùy chọn)
- host_id: "host-id" (bắt buộc nếu có images)
- images: [file1.jpg, file2.jpg, file3.jpg] (tùy chọn, tối đa 10 file, mỗi file tối đa 5MB)

// Nếu có images: Hình ảnh cũ sẽ bị xóa và thay thế bằng hình ảnh mới
// Nếu không có images: Chỉ cập nhật thông tin cơ bản
```

### 3. Geocoding thủ công

```http
POST /rooms/geocode
Content-Type: application/json

{
  "address": "123 Nguyễn Huệ, Quận 1, TP.HCM, Việt Nam"
}
```

Response:
```json
{
  "latitude": "10.7769",
  "longitude": "106.7009"
}
```

### 4. Tìm kiếm phòng theo vị trí

```http
GET /rooms?lat=10.7769&lng=106.7009&radius=5&guests=2&minPrice=300000&maxPrice=800000
```

Parameters:
- `lat`: Vĩ độ (latitude) - string
- `lng`: Kinh độ (longitude) - string
- `radius`: Bán kính tìm kiếm (km, mặc định: 10) - number
- `guests`: Số khách - number
- `minPrice`: Giá tối thiểu - number
- `maxPrice`: Giá tối đa - number
- `city`: Tên thành phố - string
- `checkIn`: Ngày check-in - string
- `checkOut`: Ngày check-out - string

### 5. Like/Unlike phòng

#### Like phòng:
```http
POST /rooms/like
Content-Type: application/json

{
  "room_id": "room-123",
  "user_id": "user-456"
}
```

#### Unlike phòng:
```http
DELETE /rooms/like/{roomId}/{userId}
```

#### Lấy danh sách phòng đã like của user:
```http
GET /rooms/liked/{userId}
```

#### Lấy số lượng like của phòng:
```http
GET /rooms/like/count/{roomId}
```

Response:
```json
{
  "room_id": "room-123",
  "like_count": 5
}
```

#### Lấy thông tin phòng với like status:
```http
GET /rooms/{roomId}?userId={userId}
```

Response:
```json
{
  "id": "room-123",
  "title": "Phòng đẹp",
  "description": "Mô tả phòng",
  "price_per_night": 500000,
  "like_count": 5,
  "user_liked": true,
  // ... các thông tin khác
}
```

## Sử dụng với Frontend

### 1. Hiển thị bản đồ

```html
<!DOCTYPE html>
<html>
<head>
    <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY"></script>
</head>
<body>
    <div id="map" style="height: 400px; width: 100%;"></div>
    
    <script>
        function initMap() {
            const map = new google.maps.Map(document.getElementById('map'), {
                center: { lat: 10.7769, lng: 106.7009 },
                zoom: 12
            });
            
            // Thêm markers cho các phòng
            rooms.forEach(room => {
                new google.maps.Marker({
                    position: { 
                        lat: parseFloat(room.latitude), 
                        lng: parseFloat(room.longitude) 
                    },
                    map: map,
                    title: room.title
                });
            });
        }
        
        initMap();
    </script>
</body>
</html>
```

### 2. Tìm kiếm theo vị trí hiện tại

```javascript
// Lấy vị trí hiện tại
navigator.geolocation.getCurrentPosition((position) => {
    const lat = position.coords.latitude.toString();
    const lng = position.coords.longitude.toString();
    
    // Tìm kiếm phòng gần vị trí hiện tại
    fetch(`/rooms?lat=${lat}&lng=${lng}&radius=5`)
        .then(response => response.json())
        .then(rooms => {
            // Hiển thị kết quả
            displayRooms(rooms);
        });
});
```

## Supabase Storage Setup

### 1. Tạo Storage Bucket

Trong Supabase Dashboard, tạo một bucket mới tên `rooms`:

```sql
-- Tạo bucket cho room images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('rooms', 'rooms', true);
```

### 2. Cấu hình Storage Policies

```sql
-- Cho phép upload file cho authenticated users
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'rooms' AND 
  auth.role() = 'authenticated'
);

-- Cho phép đọc file public
CREATE POLICY "Allow public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'rooms');

-- Cho phép update file cho owner
CREATE POLICY "Allow owner updates" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'rooms' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Cho phép delete file cho owner
CREATE POLICY "Allow owner deletes" ON storage.objects
FOR DELETE USING (
  bucket_id = 'rooms' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);
```

## Database Schema

### 1. Bảng rooms

Đảm bảo bảng `rooms` trong Supabase có các cột:

```sql
ALTER TABLE rooms 
ADD COLUMN latitude VARCHAR(20),
ADD COLUMN longitude VARCHAR(20);

-- Tạo index cho tìm kiếm theo vị trí
CREATE INDEX idx_rooms_location ON rooms USING gist (
    ll_to_earth(CAST(latitude AS DECIMAL), CAST(longitude AS DECIMAL))
);
```

### 2. Bảng room_likes

Tạo bảng để lưu trữ likes:

```sql
CREATE TABLE room_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(room_id, user_id)
);

-- Tạo index cho tìm kiếm nhanh
CREATE INDEX idx_room_likes_room_id ON room_likes(room_id);
CREATE INDEX idx_room_likes_user_id ON room_likes(user_id);
CREATE INDEX idx_room_likes_created_at ON room_likes(created_at DESC);
```

## Lưu ý quan trọng

### 1. Kiểu dữ liệu tọa độ
- **Tọa độ được lưu dưới dạng `string`** thay vì `number` để đảm bảo độ chính xác
- Khi sử dụng với Google Maps API, cần chuyển đổi sang `number` bằng `parseFloat()`
- Validation sử dụng `@IsLatitude()` và `@IsLongitude()` để đảm bảo format đúng

### 2. API Key Security
- Không bao giờ expose API key trong frontend code
- Sử dụng environment variables
- Implement rate limiting nếu cần

### 3. Error Handling
- Luôn xử lý lỗi khi geocoding thất bại
- Validate tọa độ trước khi lưu vào database
- Tuân thủ quy định về quyền riêng tư khi thu thập vị trí người dùng

### 4. File Upload
- Chỉ cho phép upload hình ảnh (mime type bắt đầu bằng 'image/')
- Giới hạn file size 5MB mỗi file
- Tối đa 10 file mỗi lần upload
- Tự động xóa file cũ khi cập nhật hình ảnh mới
- Cấu trúc folder: `room/{hostId}/{roomId}/{1.jpg, 2.jpg, ...}`

### 5. Performance
- Cache kết quả geocoding để giảm API calls
- Sử dụng database indexes cho tìm kiếm theo vị trí
- Implement pagination cho kết quả tìm kiếm lớn
- Optimize image upload với proper error handling
