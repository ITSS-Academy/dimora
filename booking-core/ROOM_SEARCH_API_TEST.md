# 🔍 Room Search API Test Guide

## 📋 Tổng quan

API search rooms sử dụng RPC function `search_rooms_nearby` để tìm kiếm rooms theo vị trí địa lý với các filter tùy chọn. **Function trả về JSON** và tất cả parameters đều optional.

## 🚀 API Endpoint

```
GET /rooms/search
```

## 📝 Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `location` | string | ✅ | Địa chỉ hoặc địa điểm để tìm kiếm |
| `checkIn` | string | ❌ | Ngày check-in (YYYY-MM-DD) |
| `checkOut` | string | ❌ | Ngày check-out (YYYY-MM-DD) |
| `guests` | number | ❌ | Số lượng khách |
| `radius` | number | ❌ | Bán kính tìm kiếm (km), default: 10 |
| `minPrice` | number | ❌ | Giá tối thiểu |
| `maxPrice` | number | ❌ | Giá tối đa |

## 🎯 Test Cases

### **1. Search cơ bản (chỉ location)**

**Request:**
```bash
curl -X GET "http://localhost:3000/rooms/search?location=Q1%20TP.HCM&radius=5"
```

**Response:**
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

### **2. Search với dates và guests**

**Request:**
```bash
curl -X GET "http://localhost:3000/rooms/search?location=Q1%20TP.HCM&checkIn=2025-01-15&checkOut=2025-01-17&guests=2&radius=5"
```

**Response:** Tương tự như trên, nhưng chỉ trả về rooms available trong khoảng thời gian đó.

### **3. Search với price range**

**Request:**
```bash
curl -X GET "http://localhost:3000/rooms/search?location=Q1%20TP.HCM&minPrice=300000&maxPrice=800000&radius=10"
```

**Response:** Chỉ trả về rooms có giá trong khoảng 300k-800k VND.

### **4. Search với tất cả filters**

**Request:**
```bash
curl -X GET "http://localhost:3000/rooms/search?location=Q1%20TP.HCM&checkIn=2025-01-15&checkOut=2025-01-17&guests=2&minPrice=300000&maxPrice=800000&radius=5"
```

**Response:** Rooms thỏa mãn tất cả điều kiện.

### **5. Search ở Hà Nội**

**Request:**
```bash
curl -X GET "http://localhost:3000/rooms/search?location=Hồ%20Hoàn%20Kiếm&radius=10&guests=4"
```

**Response:** Rooms gần Hồ Hoàn Kiếm, phù hợp cho 4 khách.

### **6. Search ở Đà Nẵng**

**Request:**
```bash
curl -X GET "http://localhost:3000/rooms/search?location=Bãi%20biển%20Mỹ%20Khê&radius=15&minPrice=200000&maxPrice=1000000"
```

**Response:** Rooms gần Bãi biển Mỹ Khê với giá 200k-1M VND.

## 🔧 Postman Collection

### **1. Search Basic**
```
Method: GET
URL: {{base_url}}/rooms/search
Query Params:
  - location: Q1 TP.HCM
  - radius: 5
```

### **2. Search with Dates**
```
Method: GET
URL: {{base_url}}/rooms/search
Query Params:
  - location: Q1 TP.HCM
  - checkIn: 2025-01-15
  - checkOut: 2025-01-17
  - guests: 2
  - radius: 5
```

### **3. Search with Price Range**
```
Method: GET
URL: {{base_url}}/rooms/search
Query Params:
  - location: Q1 TP.HCM
  - minPrice: 300000
  - maxPrice: 800000
  - radius: 10
```

### **4. Search Hanoi**
```
Method: GET
URL: {{base_url}}/rooms/search
Query Params:
  - location: Hồ Hoàn Kiếm
  - radius: 10
  - guests: 4
```

### **5. Search Da Nang**
```
Method: GET
URL: {{base_url}}/rooms/search
Query Params:
  - location: Bãi biển Mỹ Khê
  - radius: 15
  - minPrice: 200000
  - maxPrice: 1000000
```

## 🎯 Expected Behaviors

### **✅ Success Cases:**

1. **Search với location hợp lệ** → Trả về rooms trong bán kính
2. **Search với dates** → Chỉ trả về rooms available
3. **Search với guests** → Chỉ trả về rooms phù hợp số khách
4. **Search với price range** → Chỉ trả về rooms trong khoảng giá
5. **Search không có kết quả** → Trả về `[]`
6. **Search không có dates** → Trả về tất cả rooms (không check availability)

### **❌ Error Cases:**

1. **Location không tìm thấy coordinates** → 400 Bad Request
2. **Invalid date format** → 400 Bad Request
3. **Negative price** → 400 Bad Request
4. **Invalid radius** → 400 Bad Request

## 🔍 RPC Function Details

### **Function Signature:**
```sql
search_rooms_nearby(
  lat NUMERIC,
  lng NUMERIC,
  check_in_date DATE DEFAULT NULL,
  check_out_date DATE DEFAULT NULL,
  radius_km INTEGER DEFAULT 10,
  max_guests INTEGER DEFAULT NULL,
  min_price NUMERIC(10,2) DEFAULT NULL,
  max_price NUMERIC(10,2) DEFAULT NULL
) RETURNS JSON
```

### **Logic:**
1. **Geocode location** → Lấy coordinates
2. **Filter theo khoảng cách** → ST_DWithin
3. **Filter theo availability** → Chỉ khi có dates
4. **Filter theo guests** → Chỉ khi có max_guests
5. **Filter theo price** → Chỉ khi có min/max price
6. **Sort theo distance** → Gần nhất trước
7. **Return JSON** → Tất cả room info + distance_km

## 🚀 Performance Tips

### **1. Optimize Search:**
- **Radius nhỏ** → Nhanh hơn
- **Dates cụ thể** → Ít rooms hơn
- **Price range** → Giảm dataset

### **2. Indexes:**
```sql
-- Spatial index
CREATE INDEX idx_rooms_location ON rooms USING gist (
  ST_MakePoint(longitude::NUMERIC, latitude::NUMERIC)::geography
);

-- Composite index
CREATE INDEX idx_rooms_search ON rooms (
  is_available, max_guests, price_per_night, city
);
```

### **3. Caching:**
- **Popular locations** → Cache coordinates
- **Search results** → Cache cho 5-10 phút

## 🎯 Test Scenarios

### **Scenario 1: Tourist Search**
```
Location: Q1 TP.HCM
Dates: 2025-01-15 → 2025-01-17
Guests: 2
Price: 300k-800k
Expected: Rooms available, suitable for 2 people, in price range
```

### **Scenario 2: Business Travel**
```
Location: District 1
Dates: 2025-02-01 → 2025-02-03
Guests: 1
Price: 500k-1.5M
Expected: High-end rooms, single occupancy
```

### **Scenario 3: Family Vacation**
```
Location: Vũng Tàu
Dates: 2025-06-15 → 2025-06-20
Guests: 4
Price: 200k-1M
Expected: Family-friendly rooms, beach proximity
```

**API này cung cấp tính linh hoạt cao với tất cả parameters optional, cho phép search từ đơn giản đến phức tạp! 🚀**
