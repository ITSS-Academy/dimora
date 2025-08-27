# 📍 Cách tính `distance_km` - Giải thích chi tiết

## ❌ Hiểu lầm thường gặp

**KHÔNG phải** tính từ trung tâm thành phố đến khách sạn!

## ✅ Cách tính thực tế

### **`distance_km` = Khoảng cách từ VỊ TRÍ TÌM KIẾM đến KHÁCH SẠN**

## 🔍 Ví dụ cụ thể

### **Scenario 1: User tìm kiếm từ Q1 TP.HCM**

```typescript
// User search với location = "Q1 TP.HCM"
const searchParams = {
  location: "Q1 TP.HCM",  // ← Vị trí tìm kiếm
  radius: 10
};

// Server geocode "Q1 TP.HCM" thành coordinates
const searchCoordinates = {
  latitude: 10.762622,   // ← Vị trí tìm kiếm
  longitude: 106.660172
};

// Kết quả trả về
[
  {
    "id": "room-1",
    "title": "Phòng ở Q1",
    "latitude": 10.762622,
    "longitude": 106.660172,
    "distance_km": 0.0    // ← Cách vị trí tìm kiếm 0km
  },
  {
    "id": "room-2", 
    "title": "Phòng ở Q2",
    "latitude": 10.7769,
    "longitude": 106.7009,
    "distance_km": 2.3    // ← Cách vị trí tìm kiếm 2.3km
  },
  {
    "id": "room-3",
    "title": "Phòng ở Q7", 
    "latitude": 10.7322,
    "longitude": 106.7222,
    "distance_km": 8.5    // ← Cách vị trí tìm kiếm 8.5km
  }
]
```

### **Scenario 2: User tìm kiếm từ Hồ Hoàn Kiếm**

```typescript
// User search với location = "Hồ Hoàn Kiếm"
const searchParams = {
  location: "Hồ Hoàn Kiếm",  // ← Vị trí tìm kiếm
  radius: 10
};

// Server geocode "Hồ Hoàn Kiếm" thành coordinates
const searchCoordinates = {
  latitude: 21.0285,     // ← Vị trí tìm kiếm
  longitude: 105.8542
};

// Kết quả trả về
[
  {
    "id": "room-4",
    "title": "Phòng gần Hồ Hoàn Kiếm",
    "latitude": 21.0367,
    "longitude": 105.8342,
    "distance_km": 1.2    // ← Cách Hồ Hoàn Kiếm 1.2km
  },
  {
    "id": "room-5",
    "title": "Phòng ở Ba Đình",
    "latitude": 21.0422,
    "longitude": 105.8122,
    "distance_km": 3.8    // ← Cách Hồ Hoàn Kiếm 3.8km
  }
]
```

## 🎯 Cách hoạt động trong code

### **1. User gửi request:**
```typescript
// Frontend
const response = await api.get('/rooms/search', {
  params: {
    location: "Q1 TP.HCM",  // ← User muốn tìm gần đây
    radius: 10
  }
});
```

### **2. Server xử lý:**
```typescript
// Backend - rooms.service.ts
async searchRooms(params) {
  // Bước 1: Geocode location thành coordinates
  const coordinates = await this.getCoordinatesFromAddress(params.location);
  // coordinates = { latitude: 10.762622, longitude: 106.660172 }
  
  // Bước 2: Gọi RPC function với coordinates này
  const { data } = await this.supabaseService.getClient()
    .rpc('search_rooms_nearby', {
      lat_param: coordinates.latitude,    // ← Vị trí tìm kiếm
      lng_param: coordinates.longitude,   // ← Vị trí tìm kiếm
      radius_km_param: params.radius
    });
    
  return data; // Đã có distance_km tính từ vị trí tìm kiếm
}
```

### **3. RPC function tính distance:**
```sql
-- search_rooms_nearby function
'distance_km', calculate_distance_km(
  lat_param, lng_param,           -- ← Vị trí tìm kiếm (Q1 TP.HCM)
  r.latitude, r.longitude         -- ← Vị trí của từng room
)
```

## 📍 Các trường hợp tìm kiếm khác nhau

### **1. Tìm kiếm theo địa chỉ cụ thể:**
```typescript
location: "123 Nguyễn Huệ, Q1"  // ← Vị trí tìm kiếm
// distance_km = khoảng cách từ 123 Nguyễn Huệ đến từng room
```

### **2. Tìm kiếm theo địa danh:**
```typescript
location: "Bãi biển Mỹ Khê"     // ← Vị trí tìm kiếm
// distance_km = khoảng cách từ Bãi biển Mỹ Khê đến từng room
```

### **3. Tìm kiếm theo thành phố:**
```typescript
location: "TP.HCM"              // ← Vị trí tìm kiếm (thường là trung tâm)
// distance_km = khoảng cách từ trung tâm TP.HCM đến từng room
```

## 🎨 UI hiển thị

### **Frontend hiển thị:**
```typescript
const RoomCard = ({ room, searchLocation }) => (
  <div className="room-card">
    <h3>{room.title}</h3>
    <p>📍 Cách {searchLocation} {room.distance_km}km</p>
    {/* Hiển thị: "Cách Q1 TP.HCM 2.3km" */}
  </div>
);
```

### **Ví dụ hiển thị:**
- "📍 Cách Q1 TP.HCM 0.0km" (phòng ngay trong Q1)
- "📍 Cách Q1 TP.HCM 2.3km" (phòng ở Q2)
- "📍 Cách Q1 TP.HCM 8.5km" (phòng ở Q7)

## 🔄 Dynamic Search

### **User có thể thay đổi vị trí tìm kiếm:**
```typescript
// Lần 1: Tìm gần Q1
location: "Q1 TP.HCM"
// distance_km tính từ Q1

// Lần 2: Tìm gần Q7  
location: "Q7 TP.HCM"
// distance_km tính từ Q7 (hoàn toàn khác)

// Lần 3: Tìm gần sân bay
location: "Sân bay Tân Sơn Nhất"
// distance_km tính từ sân bay
```

## 🎯 Kết luận

**`distance_km` = Khoảng cách từ VỊ TRÍ TÌM KIẾM đến ROOM**

- ✅ **Linh hoạt**: User có thể tìm kiếm từ bất kỳ đâu
- ✅ **Chính xác**: Tính khoảng cách thực tế
- ✅ **Hữu ích**: User biết room cách vị trí mình muốn bao xa

**Không phải từ trung tâm thành phố, mà từ vị trí user muốn tìm kiếm! 🎯**
