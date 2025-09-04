# 🔍 Combined Search Guide - Hướng dẫn search kết hợp

## 🎯 **Bây giờ hỗ trợ cả 2 cách search:**

### **✅ 1. Search theo text (địa chỉ, thành phố):**
```bash
GET /rooms/search?location=da lat
GET /rooms/search?location=Đà Lạt
GET /rooms/search?location=vung tau
GET /rooms/search?location=Vũng Tàu
```

### **✅ 2. Search theo coordinates (kinh độ, vĩ độ):**
```bash
GET /rooms/search?location=10.762622,106.660172
GET /rooms/search?location=11.9404,108.4583
```

### **✅ 3. Kết hợp cả hai:**
```bash
GET /rooms/search?location=da lat&radius=5
GET /rooms/search?location=10.762622,106.660172&radius=10
```

## 🔧 **Logic hoạt động:**

### **1. Kiểm tra input:**
```typescript
// Nếu location có format "lat,lng" → Dùng coordinates
location: "10.762622,106.660172" → coordinates search

// Nếu location là text → Dùng text search + geocoding
location: "da lat" → text search + geocoding
```

### **2. RPC Function xử lý:**
```sql
-- Nếu có search_term → Search theo text
-- Nếu có lat_param, lng_param → Search theo coordinates
-- Nếu có cả hai → Kết hợp cả hai
```

## 🚀 **Test Examples:**

### **1. Search theo text:**
```bash
# Test search "da lat"
GET /rooms/search?location=da lat

# Test search "Đà Lạt"
GET /rooms/search?location=Đà Lạt

# Test search "vung tau"
GET /rooms/search?location=vung tau
```

### **2. Search theo coordinates:**
```bash
# Test search coordinates TP.HCM
GET /rooms/search?location=10.762622,106.660172

# Test search coordinates Đà Lạt
GET /rooms/search?location=11.9404,108.4583

# Test search coordinates Vũng Tàu
GET /rooms/search?location=10.3459,107.0843
```

### **3. Search với filters:**
```bash
# Text search với filters
GET /rooms/search?location=da lat&guests=2&minPrice=300000&maxPrice=800000

# Coordinate search với filters
GET /rooms/search?location=10.762622,106.660172&radius=5&guests=2
```

## 📊 **Expected Results:**

### **Text Search:**
```json
[
  {
    "id": "room-1",
    "title": "Phòng đẹp ở Đà Lạt",
    "city": "Đà Lạt",
    "location": "Trung tâm Đà Lạt",
    "search_score": 100,
    "distance_km": null
  }
]
```

### **Coordinate Search:**
```json
[
  {
    "id": "room-2",
    "title": "Phòng view đẹp",
    "city": "TP.HCM",
    "location": "Q1",
    "search_score": 0,
    "distance_km": 2.5
  }
]
```

### **Combined Search:**
```json
[
  {
    "id": "room-3",
    "title": "Phòng gần trung tâm",
    "city": "Đà Lạt",
    "location": "Trung tâm",
    "search_score": 70,
    "distance_km": 1.2
  }
]
```

## 🎯 **Các trường hợp sử dụng:**

### **1. User nhập địa chỉ:**
```typescript
// Frontend
location: "da lat" → Text search + Geocoding
location: "Đà Lạt" → Text search + Geocoding
location: "vung tau" → Text search + Geocoding
```

### **2. User chọn từ map:**
```typescript
// Frontend
location: "10.762622,106.660172" → Coordinate search
location: "11.9404,108.4583" → Coordinate search
```

### **3. User kết hợp:**
```typescript
// Frontend
location: "da lat" + radius: 5 → Text search + Distance filter
location: "10.762622,106.660172" + radius: 10 → Coordinate search + Distance filter
```

## ✅ **Ưu điểm:**

### **1. Linh hoạt:**
- ✅ User có thể nhập địa chỉ
- ✅ User có thể chọn từ map
- ✅ Hỗ trợ cả 2 cách

### **2. Thông minh:**
- ✅ Tự động detect format
- ✅ Kết hợp text + coordinates
- ✅ Fallback khi geocoding fail

### **3. Performance:**
- ✅ Text search nhanh
- ✅ Coordinate search chính xác
- ✅ Kết hợp tối ưu

## 🎯 **Kết luận:**

**Bây giờ search hoạt động với tất cả format:**
- ✅ "da lat" → Text search
- ✅ "Đà Lạt" → Text search
- ✅ "10.762622,106.660172" → Coordinate search
- ✅ Kết hợp cả hai → Combined search

**User experience hoàn hảo! 🎯**
