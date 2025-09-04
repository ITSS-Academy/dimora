# 🔍 Search Rooms RPC Function - Giải thích chi tiết

## 📋 Tổng quan

RPC function `search_rooms_nearby` là một PostgreSQL function được tối ưu để tìm kiếm rooms trong một bán kính nhất định từ một vị trí, với khả năng kiểm tra availability và lọc theo nhiều tiêu chí. **Function này trả về JSON** để dễ sử dụng trong NestJS.

## 🏗️ Function Signature

```sql
CREATE OR REPLACE FUNCTION search_rooms_nearby(
  lat NUMERIC,                    -- Vĩ độ của điểm tìm kiếm
  lng NUMERIC,                    -- Kinh độ của điểm tìm kiếm
  check_in_date DATE DEFAULT NULL, -- Ngày check-in (OPTIONAL)
  check_out_date DATE DEFAULT NULL, -- Ngày check-out (OPTIONAL)
  radius_km INTEGER DEFAULT 10,   -- Bán kính tìm kiếm (km)
  max_guests INTEGER DEFAULT NULL, -- Số khách tối đa (OPTIONAL)
  min_price NUMERIC(10,2) DEFAULT NULL, -- Giá tối thiểu (OPTIONAL)
  max_price NUMERIC(10,2) DEFAULT NULL  -- Giá tối đa (OPTIONAL)
)
RETURNS JSON  -- Trả về JSON thay vì TABLE
```

## 🔧 Cách hoạt động

### **1. Tính khoảng cách bằng PostGIS**

```sql
ST_Distance(
  ST_MakePoint(r.longitude::NUMERIC, r.latitude::NUMERIC)::geography,
  ST_MakePoint(lng::NUMERIC, lat::NUMERIC)::geography
) / 1000.0 as distance_km
```

- **`ST_MakePoint()`**: Tạo điểm từ tọa độ (longitude, latitude)
- **`::geography`**: Chuyển đổi sang kiểu geography để tính khoảng cách chính xác trên Trái Đất
- **`ST_Distance()`**: Tính khoảng cách giữa 2 điểm (trả về meters)
- **`/ 1000.0`**: Chuyển đổi từ meters sang kilometers

### **2. Filter theo khoảng cách**

```sql
AND ST_DWithin(
  ST_MakePoint(r.longitude::NUMERIC, r.latitude::NUMERIC)::geography,
  ST_MakePoint(lng::NUMERIC, lat::NUMERIC)::geography,
  radius_km * 1000  -- Convert km to meters
)
```

- **`ST_DWithin()`**: Kiểm tra xem điểm có nằm trong bán kính không
- **`radius_km * 1000`**: Chuyển đổi bán kính từ km sang meters

### **3. Filter theo availability (OPTIONAL)**

```sql
-- Filter theo availability (chỉ khi có check_in_date và check_out_date)
AND (
  check_in_date IS NULL 
  OR check_out_date IS NULL
  OR NOT EXISTS (
    SELECT 1 FROM bookings b
    WHERE b.room_id = r.id
      AND b.check_in_date < check_out_date
      AND b.check_out_date > check_in_date
      AND b.status IN ('pending', 'confirmed', 'in_progress', 'completed')
  )
)
```

**Logic kiểm tra overlap (chỉ khi có dates):**
- **`check_in_date IS NULL OR check_out_date IS NULL`**: Nếu không có dates thì bỏ qua availability check
- **`b.check_in_date < check_out_date`**: Booking bắt đầu trước khi search kết thúc
- **`b.check_out_date > check_in_date`**: Booking kết thúc sau khi search bắt đầu
- **Status filter**: Chỉ xem xét các booking có trạng thái active

**Ví dụ:**
```
Search: 2025-01-15 → 2025-01-17
Booking: 2025-01-16 → 2025-01-18 (OVERLAP ❌)
Booking: 2025-01-10 → 2025-01-14 (NO OVERLAP ✅)
Booking: 2025-01-18 → 2025-01-20 (NO OVERLAP ✅)
```

### **4. Các filter khác (OPTIONAL)**

```sql
-- Chỉ rooms available
AND r.is_available = true

-- Có tọa độ
AND r.latitude IS NOT NULL 
AND r.longitude IS NOT NULL

-- Filter theo số khách (optional)
AND (max_guests IS NULL OR r.max_guests >= max_guests)

-- Filter theo giá (optional)
AND (min_price IS NULL OR r.price_per_night >= min_price)
AND (max_price IS NULL OR r.price_per_night <= max_price)
```

## 📊 Ví dụ sử dụng

### **1. Search rooms trong bán kính 5km từ Q1 TP.HCM (có dates):**

```sql
SELECT * FROM search_rooms_nearby(
  lat := 10.762622,           -- Vĩ độ Q1
  lng := 106.660172,          -- Kinh độ Q1
  check_in_date := '2025-01-15',
  check_out_date := '2025-01-17',
  radius_km := 5,
  max_guests := 2,
  min_price := 300000,
  max_price := 800000
);
```

### **2. Search rooms gần Hồ Hoàn Kiếm (không có dates):**

```sql
SELECT * FROM search_rooms_nearby(
  lat := 21.0285,             -- Vĩ độ Hồ Hoàn Kiếm
  lng := 105.8542,            -- Kinh độ Hồ Hoàn Kiếm
  radius_km := 10,
  max_guests := 4
);
```

### **3. Search rooms chỉ theo vị trí (không filter gì khác):**

```sql
SELECT * FROM search_rooms_nearby(
  lat := 10.762622,
  lng := 106.660172,
  radius_km := 10
);
```

## 🎯 Kết quả trả về (JSON)

### **Format JSON:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440101",
    "title": "Phòng đẹp ở trung tâm Q1",
    "description": "Phòng view đẹp, gần trung tâm",
    "price_per_night": 500000,
    "location": "Trung tâm Q1",
    "address": "123 Nguyễn Huệ",
    "city": "TP.HCM",
    "country": "Vietnam",
    "latitude": 10.762622,
    "longitude": 106.660172,
    "max_guests": 2,
    "bedrooms": 1,
    "bathrooms": 1,
    "beds": 1,
    "room_type_id": "550e8400-e29b-41d4-a716-446655440001",
    "amenities": ["WiFi", "Điều hòa", "Bếp"],
    "images": ["image1.jpg", "image2.jpg"],
    "host_id": "550e8400-e29b-41d4-a716-446655440002",
    "is_available": true,
    "created_at": "2024-12-01T10:00:00Z",
    "updated_at": "2024-12-01T10:00:00Z",
    "distance_km": 0.5
  }
]
```

### **Fields chính:**
- **Tất cả thông tin room**: id, title, description, price, address, etc.
- **`distance_km`**: Khoảng cách từ điểm tìm kiếm (km)
- **Sắp xếp theo**: `distance_km ASC` (gần nhất trước)
- **Empty result**: Trả về `[]` nếu không tìm thấy

## ⚡ Performance Optimizations

### **1. PostGIS Index**
```sql
-- Tạo index cho geospatial search
CREATE INDEX idx_rooms_location ON rooms USING gist (
  ST_MakePoint(longitude::NUMERIC, latitude::NUMERIC)::geography
);
```

### **2. Composite Indexes**
```sql
-- Index cho các filter thường dùng
CREATE INDEX idx_rooms_search ON rooms (
  is_available,
  max_guests,
  price_per_night,
  city
);
```

### **3. Booking Index**
```sql
-- Index cho availability check
CREATE INDEX idx_bookings_availability ON bookings (
  room_id,
  check_in_date,
  check_out_date,
  status
);
```

## 🔍 Cách sử dụng trong NestJS

### **1. Service call:**
```typescript
const { data, error } = await this.supabaseService.getClient()
  .rpc('search_rooms_nearby', {
    lat: coordinates.latitude,
    lng: coordinates.longitude,
    check_in_date: params.checkIn || null,      // OPTIONAL
    check_out_date: params.checkOut || null,    // OPTIONAL
    radius_km: params.radius || 10,
    max_guests: params.guests || null,          // OPTIONAL
    min_price: params.minPrice || null,         // OPTIONAL
    max_price: params.maxPrice || null          // OPTIONAL
  });
```

### **2. Error handling:**
```typescript
if (error) {
  throw new HttpException(
    `Failed to search rooms nearby: ${error.message}`,
    HttpStatus.BAD_REQUEST
  );
}

return data || []; // Trả về array rỗng nếu không có data
```

### **3. API Usage Examples:**

**Search với dates và guests:**
```
GET /rooms/search?location=Q1 TP.HCM&checkIn=2025-01-15&checkOut=2025-01-17&guests=2&radius=5
```

**Search chỉ theo vị trí:**
```
GET /rooms/search?location=Q1 TP.HCM&radius=10
```

**Search với price range:**
```
GET /rooms/search?location=Q1 TP.HCM&minPrice=300000&maxPrice=800000
```

## 🚨 Lưu ý quan trọng

### **1. PostGIS Extension**
```sql
-- Cần enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;
```

### **2. Coordinate Validation**
- **Latitude**: -90 đến 90
- **Longitude**: -180 đến 180
- **Vietnam**: Lat ~8-23, Lng ~102-110

### **3. Optional Parameters**
- **`check_in_date`**: Nếu NULL, không check availability
- **`check_out_date`**: Nếu NULL, không check availability
- **`max_guests`**: Nếu NULL, không filter theo số khách
- **`min_price`/`max_price`**: Nếu NULL, không filter theo giá

### **4. Performance với dataset lớn**
- **Indexes**: Quan trọng cho performance
- **Radius**: Càng nhỏ càng nhanh
- **Date range**: Càng ngắn càng nhanh
- **Optional filters**: Giảm số lượng records cần xử lý

### **5. Memory Usage**
- **Large radius**: Có thể load nhiều rooms vào memory
- **Complex filters**: Có thể chậm nếu không có index phù hợp

## 🎯 Benefits

### **1. Performance**
- ✅ **Fast**: Sử dụng PostGIS native functions
- ✅ **Indexed**: Tối ưu với spatial indexes
- ✅ **Single query**: Tất cả logic trong 1 function
- ✅ **JSON return**: Không cần transform data

### **2. Accuracy**
- ✅ **Geographic distance**: Tính chính xác trên Trái Đất
- ✅ **Availability check**: Real-time booking conflicts (optional)
- ✅ **Multiple filters**: Kết hợp nhiều điều kiện (optional)

### **3. Flexibility**
- ✅ **Optional parameters**: Tất cả filters đều optional
- ✅ **Customizable radius**: Từ 0.1km đến 100km
- ✅ **Price range**: Linh hoạt theo budget
- ✅ **Date flexibility**: Có thể search không cần dates

### **4. Maintainability**
- ✅ **Centralized logic**: Tất cả search logic ở 1 chỗ
- ✅ **Easy to modify**: Thêm/sửa filters dễ dàng
- ✅ **Consistent results**: Luôn trả về format JSON giống nhau

## 🔧 Troubleshooting

### **1. PostGIS Extension Setup**
```sql
-- Bước 1: Enable PostGIS extension (QUAN TRỌNG!)
CREATE EXTENSION IF NOT EXISTS postgis;

-- Bước 2: Kiểm tra PostGIS đã được enable
SELECT PostGIS_Version();
```

### **2. Tạo Indexes (QUAN TRỌNG cho performance)**
```sql
-- Chạy file create_search_indexes.sql hoặc các lệnh sau:

-- Spatial index cho geospatial search
CREATE INDEX IF NOT EXISTS idx_rooms_location ON rooms USING gist (
  ST_MakePoint(longitude::NUMERIC, latitude::NUMERIC)::geography
);

-- Composite index cho các filter thường dùng
CREATE INDEX IF NOT EXISTS idx_rooms_search ON rooms (
  is_available, max_guests, price_per_night, city
);

-- Index cho booking availability check
CREATE INDEX IF NOT EXISTS idx_bookings_availability ON bookings (
  room_id, check_in_date, check_out_date, status
);
```

### **3. Function không tìm thấy:**
```sql
-- Kiểm tra function tồn tại
SELECT routine_name FROM information_schema.routines 
WHERE routine_name = 'search_rooms_nearby';
```

### **4. Performance issues:**
```sql
-- Kiểm tra indexes
SELECT indexname, indexdef FROM pg_indexes 
WHERE tablename = 'rooms';
```

### **5. JSON parsing issues:**
```typescript
// Trong NestJS, đảm bảo handle null/undefined
const rooms = data || [];
if (Array.isArray(rooms)) {
  return rooms;
} else {
  return [];
}
```

### **6. Common Errors:**

**Error: `syntax error at or near "::"`**
```sql
-- Nguyên nhân: Chưa enable PostGIS extension
-- Giải pháp: Chạy lệnh này trước
CREATE EXTENSION IF NOT EXISTS postgis;
```

**Error: `function st_makepoint does not exist`**
```sql
-- Nguyên nhân: PostGIS chưa được enable
-- Giải pháp: Kiểm tra và enable PostGIS
SELECT PostGIS_Version();
```

**Error: `relation "rooms" does not exist`**
```sql
-- Nguyên nhân: Bảng rooms chưa được tạo
-- Giải pháp: Tạo bảng rooms trước khi tạo indexes
```

## 🚀 Setup Instructions

### **Bước 1: Enable PostGIS**
```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

### **Bước 2: Tạo bảng rooms (nếu chưa có)**
```sql
-- Chạy rooms_table.sql
```

### **Bước 3: Tạo indexes**
```sql
-- Chạy create_search_indexes.sql
```

### **Bước 4: Tạo RPC functions**
```sql
-- Chạy booking_rpc_functions_optimized.sql
```

### **Bước 5: Test function**
```sql
-- Test với coordinates TP.HCM
SELECT * FROM search_rooms_nearby(
  lat := 10.762622,
  lng := 106.660172,
  radius_km := 10
);
```

**RPC function này là core của search functionality, cung cấp performance và accuracy cao cho việc tìm kiếm rooms theo vị trí địa lý với tính linh hoạt cao! 🚀**
