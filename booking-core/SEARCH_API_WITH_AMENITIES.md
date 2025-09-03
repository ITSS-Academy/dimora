# 🔍 **Search API với Amenities Filter**

## 🎯 **API Endpoint:**
```bash
POST /rooms/search
```

## 📋 **Request Body Parameters:**

### **1. Location (Required):**
```json
{
  "location": "da lat"          // Text search
}
```

### **2. Date Range (Optional):**
```json
{
  "checkIn": "2025-01-15",      // YYYY-MM-DD format
  "checkOut": "2025-01-20"      // YYYY-MM-DD format
}
```

### **3. Guests (Optional):**
```json
{
  "guests": 2                   // Minimum number of guests
}
```

### **4. Price Range (Optional):**
```json
{
  "minPrice": 300000,           // VND
  "maxPrice": 800000            // VND
}
```

### **5. Distance (Optional):**
```json
{
  "radius": 10                  // Kilometers from location
}
```

### **6. Amenities Filter (Optional):**
```json
{
  "amenities": [1, 2, 3, 4]     // Array of amenity IDs - Room phải có TẤT CẢ amenities này
}
```

## 🏠 **Response Format:**
```json
[
  {
    "id": "uuid",
    "title": "Villa Đà Lạt",
    "description": "Villa đẹp view núi",
    "price_per_night": 500000,
    "location": "Trung tâm Đà Lạt",
    "address": "123 Đường ABC",
    "city": "Đà Lạt",
    "country": "Việt Nam",
    "latitude": 11.9404,
    "longitude": 108.4583,
    "max_guests": 4,
    "bedrooms": 2,
    "bathrooms": 1,
    "beds": 2,
    "amenities": [
      {
        "id": 1,
        "name": "WiFi",
        "icon_name": "wifi"
      },
      {
        "id": 2,
        "name": "Điều hòa", 
        "icon_name": "air-conditioning"
      }
    ],
    "images": ["url1", "url2"],
    "host_id": "uuid",
    "is_available": true,
    "distance_km": 2.5,
    "search_score": 95
  }
]
```

## 📊 **Test Examples:**

### **1. Basic Search:**
```json
POST /rooms/search
{
  "location": "da lat"
}
```

### **2. Search với Date Range:**
```json
POST /rooms/search
{
  "location": "ho chi minh",
  "checkIn": "2025-01-15",
  "checkOut": "2025-01-20"
}
```

### **3. Search với Amenities Filter:**
```json
POST /rooms/search
{
  "location": "vung tau",
  "amenities": [1, 2, 4]  // WiFi + Điều hòa + Ti vi
}
```

### **4. Full Search với tất cả filters:**
```json
POST /rooms/search
{
  "location": "da lat",
  "checkIn": "2025-01-15",
  "checkOut": "2025-01-20", 
  "guests": 2,
  "minPrice": 300000,
  "maxPrice": 800000,
  "radius": 5,
  "amenities": [1, 2, 3]  // WiFi + Điều hòa + Tủ lạnh
}
```

## 🔧 **Amenities Logic:**

### **AND Logic (Tất cả amenities phải có):**
- Client gửi `"amenities": [1, 2, 3]`
- Room phải có **TẤT CẢ** amenities ID 1, 2, VÀ 3
- Nếu room chỉ có [1, 2] thì **KHÔNG** match

### **SQL Logic:**
```sql
-- Room amenities: ["1", "2", "3", "4"] 
-- Required amenities: [1, 2, 3]
-- Result: MATCH (room có đủ tất cả)

-- Room amenities: ["1", "2"] 
-- Required amenities: [1, 2, 3]
-- Result: NO MATCH (thiếu amenity 3)
```

## 📋 **Amenities Reference:**

### **Lấy danh sách amenities:**
```bash
GET /rooms/amenities
```

### **Response:**
```json
[
  {"id": 1, "name": "WiFi", "icon_name": "wifi"},
  {"id": 2, "name": "Điều hòa", "icon_name": "air-conditioning"},
  {"id": 3, "name": "Tủ lạnh", "icon_name": "refrigerator"},
  {"id": 4, "name": "Ti vi", "icon_name": "television"}
]
```

## ⚡ **Performance Notes:**
- Search scoring: Text relevance + Distance proximity
- Amenities filter: Efficient array intersection
- Results sorted by: search_score DESC, distance_km ASC
- Minimum search_score: 41 (high quality results only)

## 🎯 **Use Cases:**
1. **Basic location search**: Chỉ cần location
2. **Date availability**: Location + checkIn/checkOut  
3. **Amenities filtering**: Location + amenities array
4. **Comprehensive search**: All filters combined
