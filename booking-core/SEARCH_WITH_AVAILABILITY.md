# Search Rooms với Availability Check

## ✅ **Đã cập nhật search để check availability!**

### **🔧 Những gì đã thay đổi:**

#### **1. RPC Function `search_rooms_nearby`:**
```sql
-- Trước (chỉ check distance, price, guests)
CREATE OR REPLACE FUNCTION search_rooms_nearby(
  lat DECIMAL(10,8),
  lng DECIMAL(11,8),
  radius_km INTEGER DEFAULT 10,
  max_guests INTEGER DEFAULT NULL,
  min_price DECIMAL(12,2) DEFAULT NULL,
  max_price DECIMAL(12,2) DEFAULT NULL
)

-- Sau (thêm check availability)
CREATE OR REPLACE FUNCTION search_rooms_nearby(
  lat DECIMAL(10,8),
  lng DECIMAL(11,8),
  check_in_date DATE,        -- Thêm check-in date
  check_out_date DATE,       -- Thêm check-out date
  radius_km INTEGER DEFAULT 10,
  max_guests INTEGER DEFAULT NULL,
  min_price DECIMAL(12,2) DEFAULT NULL,
  max_price DECIMAL(12,2) DEFAULT NULL
)
```

#### **2. Availability Check Logic:**
```sql
-- Filter theo availability (không có booking nào trong khoảng thời gian)
AND NOT EXISTS (
  SELECT 1 FROM bookings b
  WHERE b.room_id = r.id
    AND b.check_in_date < check_out_date
    AND b.check_out_date > check_in_date
    AND b.status IN ('pending', 'confirmed', 'in_progress', 'completed')
)
```

#### **3. Service Validation:**
```typescript
// Validate check-in and check-out dates
if (!params.checkIn || !params.checkOut) {
  throw new HttpException(
    'Check-in and check-out dates are required for location-based search',
    HttpStatus.BAD_REQUEST
  );
}
```

### **🎯 Cách hoạt động:**

#### **1. Location-based Search (với coordinates):**
```typescript
// Sử dụng RPC function với availability check
const { data, error } = await supabase.rpc('search_rooms_nearby', {
  lat: 10.762622,
  lng: 106.660172,
  check_in_date: '2025-01-10',
  check_out_date: '2025-01-15',
  radius_km: 5,
  max_guests: 2,
  min_price: 100000,
  max_price: 1000000
});
```

#### **2. Regular Search (không có coordinates):**
```typescript
// Sử dụng regular query + client-side availability filter
const { data, error } = await supabase
  .from('rooms')
  .select('*')
  .eq('is_available', true)
  .ilike('city', '%TP.HCM%')
  .gte('max_guests', 2);

// Filter by availability if dates provided
if (data && params.checkIn && params.checkOut) {
  const availableRooms = data.filter(room => {
    // Check for booking conflicts
    return !room.bookings || room.bookings.every(booking => {
      const bookingStart = new Date(booking.check_in_date);
      const bookingEnd = new Date(booking.check_out_date);
      const searchStart = new Date(params.checkIn!);
      const searchEnd = new Date(params.checkOut!);
      
      // Check for overlap
      return bookingStart >= searchEnd || bookingEnd <= searchStart;
    });
  });
}
```

### **🧪 Test Examples:**

#### **1. Search với coordinates và dates:**
```bash
curl "http://localhost:3000/rooms?lat=10.762622&lng=106.660172&checkIn=2025-01-10&checkOut=2025-01-15&radius=5&guests=2"
```

#### **2. Search chỉ với dates (không có coordinates):**
```bash
curl "http://localhost:3000/rooms?checkIn=2025-01-10&checkOut=2025-01-15&city=TP.HCM&guests=2"
```

#### **3. Search không có dates (chỉ available rooms):**
```bash
curl "http://localhost:3000/rooms?city=TP.HCM&guests=2"
```

### **📊 Response Examples:**

#### **1. Available Room:**
```json
{
  "id": "room-id-1",
  "title": "Phòng đẹp",
  "latitude": 10.762622,
  "longitude": 106.660172,
  "price_per_night": 500000,
  "distance_km": 0.5,
  "is_available": true
}
```

#### **2. Room không available (sẽ không xuất hiện trong kết quả):**
```json
{
  "id": "room-id-2",
  "title": "Phòng đã book",
  "latitude": 10.765000,
  "longitude": 106.665000,
  "price_per_night": 400000,
  "distance_km": 2.1,
  "is_available": false
}
```

### **🚨 Error Cases:**

#### **1. Missing dates cho location search:**
```json
{
  "statusCode": 400,
  "message": "Check-in and check-out dates are required for location-based search"
}
```

#### **2. Invalid dates:**
```json
{
  "statusCode": 400,
  "message": "Invalid date format"
}
```

### **🎯 Benefits:**

#### **1. Accurate Search Results:**
- ✅ **Chỉ trả về rooms thực sự available**
- ✅ **Không có booking conflicts**
- ✅ **Real-time availability check**

#### **2. Better User Experience:**
- ✅ **Không hiển thị rooms đã book**
- ✅ **Giảm confusion cho users**
- ✅ **Tăng conversion rate**

#### **3. Performance:**
- ✅ **Database-level filtering** (RPC)
- ✅ **Client-side filtering** (regular search)
- ✅ **Efficient overlap detection**

### **⚠️ Important Notes:**

#### **1. Booking Status Filter:**
```sql
-- Chỉ check active bookings
AND b.status IN ('pending', 'confirmed', 'in_progress', 'completed')

-- Không check cancelled/refunded bookings
-- Không check: 'cancelled', 'no_show', 'refunded', 'disputed'
```

#### **2. Date Overlap Logic:**
```sql
-- Check for overlap
b.check_in_date < check_out_date
AND b.check_out_date > check_in_date

-- Ví dụ:
-- Booking: 2025-01-12 to 2025-01-14
-- Search: 2025-01-10 to 2025-01-15
-- Result: OVERLAP (không available)
```

#### **3. Required Parameters:**
- ✅ **Location search:** `lat`, `lng`, `checkIn`, `checkOut` (bắt buộc)
- ✅ **Regular search:** `checkIn`, `checkOut` (optional)
- ✅ **No dates:** Chỉ trả về `is_available = true` rooms

### **🔧 Deploy:**

```sql
-- Copy booking_rpc_functions_optimized.sql vào Supabase SQL Editor
-- Chạy toàn bộ script
```

**Search với availability check đã sẵn sàng sử dụng! 🚀**
