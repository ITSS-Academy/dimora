# Coordinates Usage Guide

## ✅ **Coordinates đã được chuyển sang `number` type!**

### **🔧 Cách sử dụng coordinates:**

#### **1. Create Room với coordinates:**
```json
POST /rooms
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
GET /rooms?lat=10.762622&lng=106.660172&radius=5&guests=2
```

**Parameters:**
- `lat`: Latitude (number) - Vĩ độ
- `lng`: Longitude (number) - Kinh độ  
- `radius`: Radius in km (number) - Bán kính tìm kiếm
- `guests`: Số khách (number)
- `minPrice`: Giá tối thiểu (number)
- `maxPrice`: Giá tối đa (number)

#### **3. Geocoding (tự động lấy coordinates):**
```json
POST /rooms/geocode
{
  "address": "123 Nguyễn Huệ, Quận 1, TP.HCM"
}
```

**Response:**
```json
{
  "latitude": 10.762622,
  "longitude": 106.660172
}
```

### **📊 Database Schema:**

#### **Rooms Table:**
```sql
CREATE TABLE rooms (
  -- ... other columns
  latitude DECIMAL(10,8),   -- Vĩ độ: -90.00000000 to 90.00000000
  longitude DECIMAL(11,8),  -- Kinh độ: -180.00000000 to 180.00000000
  -- ... other columns
);
```

#### **Indexes:**
```sql
-- Geospatial index cho tìm kiếm nhanh
CREATE INDEX idx_rooms_location ON rooms USING GIST (ST_MakePoint(longitude, latitude));

-- Indexes cho filter
CREATE INDEX idx_rooms_available ON rooms(is_available) WHERE is_available = true;
CREATE INDEX idx_rooms_max_guests ON rooms(max_guests);
CREATE INDEX idx_rooms_price ON rooms(price_per_night);
CREATE INDEX idx_rooms_city ON rooms(city);
```

### **🚀 RPC Function - Search Rooms Nearby:**

#### **Function: `search_rooms_nearby`**
```sql
SELECT * FROM search_rooms_nearby(
  lat := 10.762622,           -- Vĩ độ
  lng := 106.660172,          -- Kinh độ
  radius_km := 5,             -- Bán kính 5km
  max_guests := 2,            -- Tối đa 2 khách
  min_price := 100000,        -- Giá tối thiểu 100k
  max_price := 1000000        -- Giá tối đa 1M
);
```

#### **Response với distance:**
```json
[
  {
    "id": "room-id-1",
    "title": "Phòng đẹp",
    "latitude": 10.762622,
    "longitude": 106.660172,
    "price_per_night": 500000,
    "distance_km": 0.5
  },
  {
    "id": "room-id-2", 
    "title": "Phòng xa hơn",
    "latitude": 10.765000,
    "longitude": 106.665000,
    "price_per_night": 400000,
    "distance_km": 2.1
  }
]
```

### **🧪 Test Examples:**

#### **1. Create Room:**
```bash
curl -X POST http://localhost:3000/rooms \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Phòng test",
    "description": "Mô tả",
    "price_per_night": 500000,
    "address": "123 Test",
    "city": "TP.HCM",
    "country": "Việt Nam",
    "latitude": 10.762622,
    "longitude": 106.660172,
    "max_guests": 2,
    "bedrooms": 1,
    "bathrooms": 1,
    "beds": 1,
    "room_type_id": "test-id",
    "amenities": ["WiFi"],
    "host_id": "host-id"
  }'
```

#### **2. Search Rooms:**
```bash
curl "http://localhost:3000/rooms?lat=10.762622&lng=106.660172&radius=5&guests=2"
```

#### **3. Geocoding:**
```bash
curl -X POST http://localhost:3000/rooms/geocode \
  -H "Content-Type: application/json" \
  -d '{
    "address": "123 Nguyễn Huệ, Quận 1, TP.HCM"
  }'
```

### **🎯 Benefits của Number Type:**

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

### **⚠️ Important Notes:**

#### **1. Coordinate Ranges:**
- **Latitude:** -90.00000000 to 90.00000000
- **Longitude:** -180.00000000 to 180.00000000

#### **2. Precision:**
- **8 decimal places** = ~1.1mm accuracy
- **6 decimal places** = ~1.1m accuracy
- **4 decimal places** = ~11m accuracy

#### **3. Default Values:**
```typescript
// Khi không có coordinates
latitude: createRoomDto.latitude || 0,
longitude: createRoomDto.longitude || 0
```

#### **4. Validation:**
```typescript
@IsNumber()
@IsLatitude()
latitude: number;

@IsNumber()
@IsLongitude()
longitude: number;
```

### **🔧 Migration (nếu có data cũ):**

#### **Convert string to number:**
```sql
UPDATE rooms 
SET 
  latitude = CAST(latitude AS DECIMAL(10,8)),
  longitude = CAST(longitude AS DECIMAL(11,8))
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
```

#### **Validate coordinates:**
```sql
SELECT * FROM rooms 
WHERE 
  latitude < -90 OR latitude > 90 OR
  longitude < -180 OR longitude > 180;
```

**Coordinates với number type đã sẵn sàng sử dụng! 🚀**
