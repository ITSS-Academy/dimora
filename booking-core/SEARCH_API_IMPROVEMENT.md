# 🔧 Search API Improvement

## 🎯 Vấn đề trước đây

API search trước đây yêu cầu client gửi tọa độ (`lat`, `lng`) - điều này không thực tế vì:

- ❌ Client phải tự geocode địa chỉ
- ❌ Phức tạp cho frontend
- ❌ Không user-friendly
- ❌ Yêu cầu kiến thức về tọa độ

## ✅ Giải pháp mới

### **Thay đổi DTO:**
```typescript
// Trước
export class SearchRoomsDto {
  lat?: number;    // ❌ Client phải tự geocode
  lng?: number;    // ❌ Client phải tự geocode
  // ...
}

// Sau
export class SearchRoomsDto {
  location?: string; // ✅ Client chỉ cần gửi địa chỉ
  // ...
}
```

### **Thay đổi Service Logic:**
```typescript
// Trước
if (params.lat && params.lng) {
  // Sử dụng tọa độ trực tiếp
  .rpc('search_rooms_nearby', {
    lat: params.lat,
    lng: params.lng,
    // ...
  });
}

// Sau
if (params.location) {
  // Tự động geocode địa chỉ
  const coordinates = await this.getCoordinatesFromAddress(params.location);
  
  .rpc('search_rooms_nearby', {
    lat: coordinates.latitude,
    lng: coordinates.longitude,
    // ...
  });
}
```

## 🚀 Benefits

### **Cho Client:**
- ✅ **Đơn giản:** Chỉ cần gửi địa chỉ text
- ✅ **User-friendly:** Người dùng nhập địa chỉ bình thường
- ✅ **Linh hoạt:** Hỗ trợ nhiều format địa chỉ
- ✅ **Không cần kiến thức kỹ thuật:** Không cần biết tọa độ

### **Cho Server:**
- ✅ **Tự động geocode:** Server xử lý việc chuyển đổi địa chỉ
- ✅ **Chính xác:** Sử dụng Google Maps API
- ✅ **Nhất quán:** Logic tập trung ở server
- ✅ **Bảo mật:** API key được bảo vệ ở server

## 📝 Cách sử dụng mới

### **Get All Rooms:**
```bash
# Lấy tất cả rooms
curl "http://localhost:3000/rooms"
```

### **Search theo địa chỉ:**
```bash
# Trước (không thực tế)
curl "http://localhost:3000/rooms?lat=10.762622&lng=106.660172&radius=5&checkIn=2025-01-15&checkOut=2025-01-17&guests=2"

# Sau (thực tế)
curl "http://localhost:3000/rooms/search?location=Quận 1, TP.HCM&radius=5&checkIn=2025-01-15&checkOut=2025-01-17&guests=2"
```

### **Search theo thành phố:**
```bash
# Endpoint riêng biệt
curl "http://localhost:3000/rooms/search?city=TP.HCM&checkIn=2025-01-15&checkOut=2025-01-17&guests=2"
```

### **Search kết hợp:**
```bash
# Địa chỉ + giá + khách
curl "http://localhost:3000/rooms/search?location=Đà Nẵng&radius=15&minPrice=500000&maxPrice=1500000&guests=4&checkIn=2025-01-15&checkOut=2025-01-17"
```

## 🔍 Các loại địa chỉ hỗ trợ

### **1. Địa chỉ cụ thể:**
```
"123 Nguyễn Huệ, Quận 1, TP.HCM"
"15 Hàng Gai, Hoàn Kiếm, Hà Nội"
"Bãi Dài, Phú Quốc"
```

### **2. Địa điểm nổi tiếng:**
```
"Chợ Bến Thành, TP.HCM"
"Hồ Hoàn Kiếm, Hà Nội"
"Bãi biển Mỹ Khê, Đà Nẵng"
```

### **3. Khu vực:**
```
"Quận 1, TP.HCM"
"Hoàn Kiếm, Hà Nội"
"Đà Nẵng"
```

### **4. Landmark:**
```
"Lăng Bác, Hà Nội"
"Phố cổ Hội An"
"Núi Fansipan, Sapa"
```

## ⚡ Workflow

1. **Client gửi request** với `location` parameter
2. **Server nhận địa chỉ** từ client
3. **Server geocode** địa chỉ thành tọa độ (Google Maps API)
4. **Server search** rooms trong bán kính (PostGIS RPC)
5. **Server trả về** kết quả cho client

## 🎯 Test Cases

### **Địa chỉ cụ thể:**
```bash
curl "http://localhost:3000/rooms/search?location=Quận 1, TP.HCM&radius=5&checkIn=2025-01-15&checkOut=2025-01-17&guests=2"
```

### **Địa điểm nổi tiếng:**
```bash
curl "http://localhost:3000/rooms/search?location=Hồ Hoàn Kiếm, Hà Nội&radius=10&checkIn=2025-01-15&checkOut=2025-01-17&guests=2"
```

### **Thành phố:**
```bash
curl "http://localhost:3000/rooms/search?location=Đà Nẵng&radius=15&checkIn=2025-01-15&checkOut=2025-01-17&guests=4"
```

## 🔧 Error Handling

### **Địa chỉ không tìm thấy:**
```json
{
  "statusCode": 400,
  "message": "Could not find coordinates for the provided location"
}
```

### **Thiếu ngày check-in/check-out:**
```json
{
  "statusCode": 400,
  "message": "Check-in and check-out dates are required for location-based search"
}
```

## 📊 So sánh

| Aspect | Trước | Sau |
|--------|-------|-----|
| **Client Input** | Tọa độ (lat, lng) | Địa chỉ text |
| **User Experience** | Phức tạp | Đơn giản |
| **Geocoding** | Client phải làm | Server tự động |
| **Flexibility** | Hạn chế | Linh hoạt |
| **Error Handling** | Ít thông tin | Chi tiết |
| **Maintenance** | Phức tạp | Dễ dàng |

## 🚀 Kết luận

API search mới **user-friendly** và **thực tế** hơn nhiều:

- ✅ **Client đơn giản:** Chỉ cần gửi địa chỉ
- ✅ **Server thông minh:** Tự động geocode và search
- ✅ **User experience tốt:** Người dùng nhập địa chỉ bình thường
- ✅ **Maintainable:** Logic tập trung ở server

**API đã sẵn sàng để sử dụng! 🎉**
