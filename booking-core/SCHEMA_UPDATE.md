# Schema Update - Match với Database Thực tế

## ✅ **Đã cập nhật để match với schema database thực tế!**

### **🔧 Schema Database Thực tế:**

#### **Rooms Table:**
```sql
CREATE TABLE public.rooms (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NULL,
  price_per_night numeric(10,2) NOT NULL,
  location text NOT NULL,
  address text NOT NULL,
  city text NOT NULL,
  country text NOT NULL,
  max_guests integer NOT NULL DEFAULT 1,
  bedrooms integer NOT NULL DEFAULT 0,
  bathrooms integer NOT NULL DEFAULT 0,
  beds integer NOT NULL DEFAULT 0,
  room_type_id uuid NOT NULL,
  amenities text[] NULL DEFAULT '{}'::text[],
  images text[] NULL DEFAULT '{}'::text[],
  host_id uuid NOT NULL,
  is_available boolean NULL DEFAULT true,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  latitude numeric NULL,
  longitude numeric NULL,
  postal_code numeric NULL,
  CONSTRAINT rooms_pkey PRIMARY KEY (id),
  CONSTRAINT rooms_host_id_fkey FOREIGN KEY (host_id) REFERENCES users (id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT rooms_room_type_id_fkey FOREIGN KEY (room_type_id) REFERENCES room_types (id)
);
```

### **🔧 Những gì đã cập nhật:**

#### **1. RPC Function `search_rooms_nearby`:**
```sql
-- Trước
CREATE OR REPLACE FUNCTION search_rooms_nearby(
  lat DECIMAL(10,8),
  lng DECIMAL(11,8),
  -- ...
)

-- Sau (match với database)
CREATE OR REPLACE FUNCTION search_rooms_nearby(
  lat NUMERIC,
  lng NUMERIC,
  check_in_date DATE,
  check_out_date DATE,
  radius_km INTEGER DEFAULT 10,
  max_guests INTEGER DEFAULT NULL,
  min_price NUMERIC(10,2) DEFAULT NULL,
  max_price NUMERIC(10,2) DEFAULT NULL
)
```

#### **2. Entity (`src/rooms/entities/room.entity.ts`):**
```typescript
// Thêm postal_code field
export class Room {
  // ... existing fields
  latitude: number;
  longitude: number;
  postal_code: number;  // Thêm field này
  // ... other fields
}
```

#### **3. DTO (`src/rooms/dto/create-room.dto.ts`):**
```typescript
// Sửa postal_code từ string sang number
export class CreateRoomDto {
  // ... existing fields
  @IsOptional()
  @IsNumber()
  postal_code?: number;  // Thay đổi từ string sang number
  
  @IsNumber()
  @IsLatitude()
  latitude: number;
  
  @IsNumber()
  @IsLongitude()
  longitude: number;
  // ... other fields
}
```

#### **4. Database Schema (`rooms_table.sql`):**
```sql
-- Cập nhật để match với schema thực tế
CREATE TABLE rooms (
  -- ... existing columns
  latitude NUMERIC,      -- Thay đổi từ DECIMAL(10,8)
  longitude NUMERIC,     -- Thay đổi từ DECIMAL(11,8)
  postal_code NUMERIC,   -- Thêm field này
  -- ... other columns
);
```

### **📊 Data Types Mapping:**

| Field | Database Type | Entity Type | DTO Type | Notes |
|-------|---------------|-------------|----------|-------|
| `latitude` | `NUMERIC` | `number` | `number` | Vĩ độ |
| `longitude` | `NUMERIC` | `number` | `number` | Kinh độ |
| `postal_code` | `NUMERIC` | `number` | `number?` | Mã bưu điện |
| `price_per_night` | `NUMERIC(10,2)` | `number` | `number` | Giá phòng |

### **🧪 Test Examples:**

#### **1. Create Room với coordinates:**
```json
{
  "title": "Phòng đẹp",
  "description": "Mô tả phòng",
  "price_per_night": 500000,
  "address": "123 Nguyễn Huệ",
  "city": "TP.HCM",
  "country": "Việt Nam",
  "latitude": 10.762622,
  "longitude": 106.660172,
  "postal_code": 700000,
  "max_guests": 2,
  "bedrooms": 1,
  "bathrooms": 1,
  "beds": 1,
  "room_type_id": "room-type-id",
  "amenities": ["WiFi", "Điều hòa"],
  "host_id": "host-id"
}
```

#### **2. Search Rooms với coordinates:**
```bash
curl "http://localhost:3000/rooms?lat=10.762622&lng=106.660172&checkIn=2025-01-10&checkOut=2025-01-15&radius=5&guests=2"
```

### **🚀 RPC Function Usage:**

#### **Search Rooms Nearby:**
```typescript
const { data, error } = await supabase.rpc('search_rooms_nearby', {
  lat: 10.762622,           // NUMERIC
  lng: 106.660172,          // NUMERIC
  check_in_date: '2025-01-10',
  check_out_date: '2025-01-15',
  radius_km: 5,
  max_guests: 2,
  min_price: 100000,        // NUMERIC(10,2)
  max_price: 1000000        // NUMERIC(10,2)
});
```

### **⚠️ Important Notes:**

#### **1. NUMERIC vs DECIMAL:**
- ✅ **NUMERIC** - PostgreSQL's standard numeric type
- ✅ **DECIMAL** - Alias for NUMERIC
- ✅ **Both work the same** in PostgreSQL

#### **2. Coordinates Precision:**
- ✅ **NUMERIC** có thể lưu coordinates với độ chính xác cao
- ✅ **Không cần giới hạn precision** như DECIMAL(10,8)
- ✅ **Flexible** cho các use cases khác nhau

#### **3. PostGIS Compatibility:**
```sql
-- PostGIS functions work với NUMERIC
ST_MakePoint(r.longitude::NUMERIC, r.latitude::NUMERIC)::geography
ST_Distance(
  ST_MakePoint(r.longitude::NUMERIC, r.latitude::NUMERIC)::geography,
  ST_MakePoint(lng::NUMERIC, lat::NUMERIC)::geography
)
```

### **🔧 Deploy:**

```sql
-- Copy booking_rpc_functions_optimized.sql vào Supabase SQL Editor
-- Chạy toàn bộ script
```

### **🎯 Benefits:**

- ✅ **Match với database schema** thực tế
- ✅ **No type conversion errors**
- ✅ **Consistent data types**
- ✅ **Better performance** (không cần CAST)
- ✅ **PostGIS compatibility**

**Schema đã được cập nhật để match với database thực tế! 🚀**
