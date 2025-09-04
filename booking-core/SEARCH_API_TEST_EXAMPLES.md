# 🔍 Search API Test Examples - Test đầy đủ filters

## 🎯 **API Endpoint:**
```bash
POST /rooms/search
```

## 📋 **Request Body Parameters:**

### **1. Location (Required):**
```json
{
  "location": "da lat"          // Text search
  "location": "Đà Lạt"          // Vietnamese text
  "location": "10.762622,106.660172"  // Coordinates
}
```

### **2. Date Filters (Optional):**
```json
{
  "checkIn": "2025-01-15",      // Check-in date (YYYY-MM-DD)
  "checkOut": "2025-01-20"      // Check-out date (YYYY-MM-DD)
}
```

### **3. Guest & Capacity (Optional):**
```json
{
  "guests": 2                   // Số khách tối thiểu
}
```

### **4. Price Filters (Optional):**
```json
{
  "minPrice": 300000,           // Giá tối thiểu (VND)
  "maxPrice": 800000            // Giá tối đa (VND)
}
```

### **5. Radius Filter (Optional):**
```json
{
  "radius": 5                   // Bán kính tìm kiếm (km)
}
```

## 🚀 **Test Examples:**

### **1. Search cơ bản:**
```json
# Chỉ location
POST /rooms/search
{
  "location": "da lat"
}

# Location + radius
POST /rooms/search
{
  "location": "da lat",
  "radius": 5
}

# Location + guests
POST /rooms/search
{
  "location": "da lat",
  "guests": 2
}
```

### **2. Search với date:**
```json
# Location + check-in
POST /rooms/search
{
  "location": "da lat",
  "checkIn": "2025-01-15"
}

# Location + check-out
POST /rooms/search
{
  "location": "da lat",
  "checkOut": "2025-01-20"
}

# Location + cả hai date
POST /rooms/search
{
  "location": "da lat",
  "checkIn": "2025-01-15",
  "checkOut": "2025-01-20"
}
```

### **3. Search với price:**
```json
# Location + min price
POST /rooms/search
{
  "location": "da lat",
  "minPrice": 300000
}

# Location + max price
POST /rooms/search
{
  "location": "da lat",
  "maxPrice": 800000
}

# Location + khoảng giá
POST /rooms/search
{
  "location": "da lat",
  "minPrice": 300000,
  "maxPrice": 800000
}
```

### **4. Search với coordinates:**
```json
# Coordinates TP.HCM
POST /rooms/search
{
  "location": "10.762622,106.660172"
}

# Coordinates + radius
POST /rooms/search
{
  "location": "10.762622,106.660172",
  "radius": 10
}

# Coordinates + guests
POST /rooms/search
{
  "location": "10.762622,106.660172",
  "guests": 2
}
```

### **5. Search kết hợp tất cả:**
```json
# Full search với text location
POST /rooms/search
{
  "location": "da lat",
  "checkIn": "2025-01-15",
  "checkOut": "2025-01-20",
  "guests": 2,
  "minPrice": 300000,
  "maxPrice": 800000,
  "radius": 5
}

# Full search với coordinates
POST /rooms/search
{
  "location": "10.762622,106.660172",
  "checkIn": "2025-01-15",
  "checkOut": "2025-01-20",
  "guests": 2,
  "minPrice": 300000,
  "maxPrice": 800000,
  "radius": 10
}
```

## 📊 **Expected Response:**

### **1. Success Response:**
```json
[
  {
    "id": "room-uuid-1",
    "title": "Phòng đẹp ở Đà Lạt",
    "description": "Phòng view núi đẹp",
    "price_per_night": 500000,
    "location": "Trung tâm Đà Lạt",
    "address": "123 Đường Đà Lạt",
    "city": "Đà Lạt",
    "country": "Việt Nam",
    "latitude": 11.9404,
    "longitude": 108.4583,
    "max_guests": 2,
    "bedrooms": 1,
    "bathrooms": 1,
    "beds": 1,
    "room_type_id": "room-type-uuid",
    "amenities": ["WiFi", "Điều hòa", "Bếp"],
    "images": ["image1.jpg", "image2.jpg"],
    "host_id": "host-uuid",
    "is_available": true,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z",
    "distance_km": 2.5,
    "search_score": 100
  }
]
```

### **2. Empty Response:**
```json
[]
```

### **3. Error Response:**
```json
{
  "statusCode": 400,
  "message": "Could not find coordinates for the provided location"
}
```

## 🔧 **Test Cases:**

### **1. Text Search:**
```json
# Test Vietnamese text
POST /rooms/search
{
  "location": "Đà Lạt"
}

# Test English text
POST /rooms/search
{
  "location": "da lat"
}

# Test mixed text
POST /rooms/search
{
  "location": "vung tau"
}
```

### **2. Coordinate Search:**
```json
# Test TP.HCM coordinates
POST /rooms/search
{
  "location": "10.762622,106.660172"
}

# Test Đà Lạt coordinates
POST /rooms/search
{
  "location": "11.9404,108.4583"
}

# Test Vũng Tàu coordinates
POST /rooms/search
{
  "location": "10.3459,107.0843"
}
```

### **3. Filter Combinations:**
```json
# Text + Date + Guests
POST /rooms/search
{
  "location": "da lat",
  "checkIn": "2025-01-15",
  "checkOut": "2025-01-20",
  "guests": 2
}

# Text + Price + Radius
POST /rooms/search
{
  "location": "da lat",
  "minPrice": 300000,
  "maxPrice": 800000,
  "radius": 5
}

# Coordinates + Date + Price
POST /rooms/search
{
  "location": "10.762622,106.660172",
  "checkIn": "2025-01-15",
  "checkOut": "2025-01-20",
  "minPrice": 300000,
  "maxPrice": 800000
}
```

### **4. Edge Cases:**
```json
# Empty location
POST /rooms/search
{
  "location": ""
}

# Invalid coordinates
POST /rooms/search
{
  "location": "invalid,coordinates"
}

# Invalid date format
POST /rooms/search
{
  "location": "da lat",
  "checkIn": "invalid-date"
}

# Negative price
POST /rooms/search
{
  "location": "da lat",
  "minPrice": -1000
}

# Invalid radius
POST /rooms/search
{
  "location": "da lat",
  "radius": -5
}
```

## ✅ **Test Checklist:**

### **1. Basic Search:**
- [ ] Text search với tiếng Việt
- [ ] Text search với tiếng Anh
- [ ] Coordinate search
- [ ] Empty results khi không tìm thấy

### **2. Filter Tests:**
- [ ] Date filters (checkIn, checkOut)
- [ ] Guest filter
- [ ] Price filters (minPrice, maxPrice)
- [ ] Radius filter

### **3. Combination Tests:**
- [ ] Text + Date + Guests
- [ ] Text + Price + Radius
- [ ] Coordinates + Date + Price
- [ ] Tất cả filters cùng lúc

### **4. Error Handling:**
- [ ] Invalid location
- [ ] Invalid date format
- [ ] Invalid coordinates
- [ ] Invalid price values

## 🎯 **Kết luận:**

**Search API hỗ trợ đầy đủ filters:**
- ✅ **Location**: Text hoặc coordinates
- ✅ **Dates**: Check-in, check-out
- ✅ **Guests**: Số khách
- ✅ **Price**: Min, max
- ✅ **Radius**: Bán kính tìm kiếm
- ✅ **Combined**: Tất cả filters cùng lúc

**Test đầy đủ để đảm bảo hoạt động chính xác! 🚀**
