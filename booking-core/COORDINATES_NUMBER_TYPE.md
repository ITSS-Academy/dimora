# Coordinates: String vs Number Type

## ✅ **Đã thay đổi coordinates từ `string` sang `number`!**

### **🎯 Tại sao nên dùng `number` thay vì `string`:**

#### **1. Tính toán và so sánh:**
```typescript
// Với number - có thể tính toán
const lat1 = 10.762622;
const lat2 = 10.762623;
const distance = Math.abs(lat1 - lat2); // ✅ Hoạt động

// Với string - không thể tính toán trực tiếp
const lat1 = "10.762622";
const lat2 = "10.762623";
const distance = Math.abs(lat1 - lat2); // ❌ NaN
```

#### **2. Database queries:**
```sql
-- Với number - có thể dùng toán tử so sánh
SELECT * FROM rooms 
WHERE latitude BETWEEN 10.7 AND 10.8; -- ✅ Hoạt động

-- Với string - phải convert
SELECT * FROM rooms 
WHERE CAST(latitude AS DECIMAL) BETWEEN 10.7 AND 10.8; -- ❌ Phức tạp
```

#### **3. Geospatial functions:**
```sql
-- Với number - Supabase PostGIS hoạt động tốt
SELECT * FROM rooms 
WHERE ST_DWithin(
  ST_MakePoint(longitude, latitude), 
  ST_MakePoint(106.660172, 10.762622), 
  1000
); -- ✅ Hoạt động

-- Với string - phải convert
SELECT * FROM rooms 
WHERE ST_DWithin(
  ST_MakePoint(CAST(longitude AS DECIMAL), CAST(latitude AS DECIMAL)), 
  ST_MakePoint(106.660172, 10.762622), 
  1000
); -- ❌ Phức tạp
```

### **🔧 Files đã được cập nhật:**

#### **1. Entity (`src/rooms/entities/room.entity.ts`)**
```typescript
// Trước
latitude: string;
longitude: string;

// Sau
latitude: number;
longitude: number;
```

#### **2. DTOs:**
```typescript
// CreateRoomDto
@IsNumber()
@IsLatitude()
latitude: number;

@IsNumber()
@IsLongitude()
longitude: number;

// SearchRoomsDto
@Type(() => Number)
@IsNumber()
@IsLatitude()
lat?: number;

@Type(() => Number)
@IsNumber()
@IsLongitude()
lng?: number;

// CreateRoomWithImagesDto
@Type(() => Number)
@IsNumber()
@IsLatitude()
latitude?: number;

@Type(() => Number)
@IsNumber()
@IsLongitude()
longitude?: number;
```

#### **3. Database Schema (`rooms_table.sql`)**
```sql
-- Trước
latitude TEXT,
longitude TEXT,

-- Sau
latitude DECIMAL(10,8),
longitude DECIMAL(11,8),
```

#### **4. Service (`src/rooms/rooms.service.ts`)**
```typescript
// Trước
async getCoordinatesFromAddress(address: string): Promise<{latitude: string, longitude: string}>

// Sau
async getCoordinatesFromAddress(address: string): Promise<{latitude: number, longitude: number}>
```

### **📊 Database Column Types:**

#### **Latitude: `DECIMAL(10,8)`**
- **10 digits total** (2 before decimal, 8 after)
- **Range:** -90.00000000 to 90.00000000
- **Precision:** 8 decimal places (very accurate)

#### **Longitude: `DECIMAL(11,8)`**
- **11 digits total** (3 before decimal, 8 after)
- **Range:** -180.00000000 to 180.00000000
- **Precision:** 8 decimal places (very accurate)

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
```json
{
  "lat": 10.762622,
  "lng": 106.660172,
  "radius": 5.0,
  "guests": 2
}
```

### **🚀 Benefits:**

#### **Performance:**
- ✅ **Faster queries** - không cần CAST
- ✅ **Better indexing** - number indexes nhanh hơn
- ✅ **Efficient comparisons** - so sánh trực tiếp

#### **Functionality:**
- ✅ **Mathematical operations** - tính khoảng cách
- ✅ **Geospatial queries** - PostGIS functions
- ✅ **Range queries** - BETWEEN, >, <
- ✅ **Sorting** - ORDER BY coordinates

#### **Data Integrity:**
- ✅ **Type safety** - TypeScript validation
- ✅ **Precision control** - 8 decimal places
- ✅ **Range validation** - latitude: -90 to 90, longitude: -180 to 180

### **⚠️ Migration Notes:**

#### **Nếu có data cũ (string):**
```sql
-- Convert existing string data to number
UPDATE rooms 
SET 
  latitude = CAST(latitude AS DECIMAL(10,8)),
  longitude = CAST(longitude AS DECIMAL(11,8))
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
```

#### **Validation:**
```sql
-- Check for invalid coordinates
SELECT * FROM rooms 
WHERE 
  latitude < -90 OR latitude > 90 OR
  longitude < -180 OR longitude > 180;
```

### **🎯 Best Practices:**

#### **1. Validation:**
```typescript
// Trong DTO
@IsLatitude()
latitude: number;

@IsLongitude()
longitude: number;
```

#### **2. Default Values:**
```typescript
// Khi không có coordinates
latitude: createRoomDto.latitude || 0,
longitude: createRoomDto.longitude || 0
```

#### **3. Geocoding:**
```typescript
// Google Maps API trả về number
const location = data.results[0].geometry.location;
return {
  latitude: location.lat,  // number
  longitude: location.lng  // number
};
```

**Kết luận: Sử dụng `number` cho coordinates là best practice! 🚀**
