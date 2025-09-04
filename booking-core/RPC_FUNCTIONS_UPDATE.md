# RPC Functions Update

## ✅ **Đã cập nhật RPC functions!**

### **🔧 Những gì đã sửa:**

#### **1. Function `get_room_availability_calendar`:**
```sql
-- Trước (có thể gây lỗi)
WHILE current_date_val <= end_date LOOP
  -- logic
  current_date_val := current_date_val + INTERVAL '1 day';
END LOOP;

-- Sau (ổn định hơn)
SELECT generate_series(start_date, end_date, '1 day'::interval)::date as date_val
```

#### **2. Grant Permissions:**
```sql
-- Trước (sai function name)
GRANT EXECUTE ON FUNCTION check_room_availability(UUID, DATE, DATE) TO authenticated;

-- Sau (đúng function name)
GRANT EXECUTE ON FUNCTION check_room_availability_api(UUID, DATE, DATE) TO authenticated;
```

#### **3. Thêm Function `search_rooms_nearby`:**
```sql
-- Function mới để search rooms với coordinates
CREATE OR REPLACE FUNCTION search_rooms_nearby(
  lat DECIMAL(10,8),
  lng DECIMAL(11,8),
  radius_km INTEGER DEFAULT 10,
  max_guests INTEGER DEFAULT NULL,
  min_price DECIMAL(12,2) DEFAULT NULL,
  max_price DECIMAL(12,2) DEFAULT NULL
)
```

### **📋 Danh sách RPC Functions hiện tại:**

#### **1. Booking Functions:**
- ✅ `get_host_bookings(host_uuid)` - Lấy bookings của host
- ✅ `get_room_bookings(room_uuid, host_uuid)` - Lấy bookings của room
- ✅ `get_host_bookings_by_date_range(host_uuid, start_date, end_date)` - Lấy bookings theo khoảng thời gian
- ✅ `get_host_booking_stats(host_uuid)` - Lấy thống kê booking của host
- ✅ `check_room_availability_api(room_uuid, check_in_date, check_out_date)` - Check availability
- ✅ `get_user_bookings(user_uuid)` - Lấy bookings của user
- ✅ `get_room_availability_calendar(room_uuid, host_uuid, start_date, end_date)` - Lấy lịch availability

#### **2. Room Search Function:**
- ✅ `search_rooms_nearby(lat, lng, radius_km, max_guests, min_price, max_price)` - Search rooms gần đây

### **🚀 Cách sử dụng:**

#### **1. Search Rooms với coordinates:**
```typescript
// Trong service
const { data, error } = await supabase.rpc('search_rooms_nearby', {
  lat: 10.762622,
  lng: 106.660172,
  radius_km: 5,
  max_guests: 2,
  min_price: 100000,
  max_price: 1000000
});
```

#### **2. Check Room Availability:**
```typescript
// Trong service
const { data, error } = await supabase.rpc('check_room_availability_api', {
  room_uuid: 'room-id',
  check_in_date: '2025-01-10',
  check_out_date: '2025-01-15'
});
```

#### **3. Get Host Bookings:**
```typescript
// Trong service
const { data, error } = await supabase.rpc('get_host_bookings', {
  host_uuid: 'host-id'
});
```

### **📊 Performance Improvements:**

#### **1. Generate Series vs While Loop:**
```sql
-- Trước (While Loop)
WHILE current_date_val <= end_date LOOP
  -- Có thể gây lỗi syntax

-- Sau (Generate Series)
SELECT generate_series(start_date, end_date, '1 day'::interval)::date
-- Nhanh hơn và ổn định hơn
```

#### **2. PostGIS Geospatial Search:**
```sql
-- Tính khoảng cách chính xác
ST_Distance(
  ST_MakePoint(r.longitude, r.latitude)::geography,
  ST_MakePoint(lng, lat)::geography
) / 1000.0 as distance_km

-- Filter theo bán kính
ST_DWithin(
  ST_MakePoint(r.longitude, r.latitude)::geography,
  ST_MakePoint(lng, lat)::geography,
  radius_km * 1000
)
```

### **🧪 Test Examples:**

#### **1. Search Rooms:**
```bash
curl "http://localhost:3000/rooms?lat=10.762622&lng=106.660172&radius=5&guests=2"
```

#### **2. Get Host Bookings:**
```bash
curl "http://localhost:3000/bookings/host/host-id"
```

#### **3. Check Availability:**
```bash
curl "http://localhost:3000/bookings/availability/room-id?checkIn=2025-01-10&checkOut=2025-01-15"
```

### **⚠️ Important Notes:**

#### **1. PostGIS Extension:**
```sql
-- Cần enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;
```

#### **2. Indexes:**
```sql
-- Geospatial index cho performance
CREATE INDEX idx_rooms_location ON rooms USING GIST (ST_MakePoint(longitude, latitude));
```

#### **3. Coordinates Type:**
- ✅ **Latitude:** `DECIMAL(10,8)` - Range: -90 to 90
- ✅ **Longitude:** `DECIMAL(11,8)` - Range: -180 to 180

### **🎯 Benefits:**

- ✅ **Stable functions** - không còn lỗi syntax
- ✅ **Better performance** - generate_series nhanh hơn while loop
- ✅ **Geospatial search** - tính khoảng cách chính xác
- ✅ **Type safety** - number coordinates
- ✅ **Comprehensive search** - filter theo nhiều tiêu chí

### **🔧 Deploy:**

```sql
-- Copy booking_rpc_functions_optimized.sql vào Supabase SQL Editor
-- Chạy toàn bộ script
```

**RPC functions đã được cập nhật và sẵn sàng sử dụng! 🚀**
