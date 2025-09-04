# 🔍 Search Test Guide - Hướng dẫn test

## 🎯 **RPC Function đã được sửa!**

### **✅ Thay đổi chính:**

#### **1. Không bắt buộc coordinates:**
```sql
-- Trước: Phải có lat_param, lng_param
-- Sau: lat_param, lng_param có thể NULL
```

#### **2. Logic search đơn giản:**
```sql
-- Chỉ cần search_term là đủ
-- Không cần geocoding
-- Không cần coordinates
```

## 🚀 **Test ngay:**

### **1. Test Search theo text:**
```sql
-- Test search "da lat"
SELECT * FROM search_rooms_nearby(
  search_term := 'da lat'
);

-- Test search "Đà Lạt"
SELECT * FROM search_rooms_nearby(
  search_term := 'Đà Lạt'
);

-- Test search "dalat"
SELECT * FROM search_rooms_nearby(
  search_term := 'dalat'
);
```

### **2. Test API:**
```bash
# Test search "da lat"
GET /rooms/search?location=da lat

# Test search "Đà Lạt"
GET /rooms/search?location=Đà Lạt

# Test search "dalat"
GET /rooms/search?location=dalat

# Test với filters
GET /rooms/search?location=da lat&guests=2&minPrice=300000
```

## 🔍 **Các trường hợp test:**

### **1. Database có "Đà Lạt":**
```sql
-- User search: "da lat" → Tìm được ✅
-- User search: "Đà Lạt" → Tìm được ✅
-- User search: "dalat" → Tìm được ✅
```

### **2. Database có "Da Lat":**
```sql
-- User search: "da lat" → Tìm được ✅
-- User search: "Đà Lạt" → Tìm được ✅
-- User search: "dalat" → Tìm được ✅
```

### **3. Database có "da lat":**
```sql
-- User search: "da lat" → Tìm được ✅
-- User search: "Đà Lạt" → Tìm được ✅
-- User search: "dalat" → Tìm được ✅
```

## 📊 **Expected Results:**

### **Search "da lat":**
```json
[
  {
    "id": "room-1",
    "title": "Phòng đẹp ở Đà Lạt",
    "city": "Đà Lạt",
    "location": "Trung tâm Đà Lạt",
    "search_score": 70,  // Partial match city
    "distance_km": null  // Không có coordinates
  },
  {
    "id": "room-2",
    "title": "Phòng view núi",
    "city": "Da Lat",
    "location": "Gần Hồ Xuân Hương",
    "search_score": 70,  // Partial match city
    "distance_km": null
  }
]
```

## 🎯 **Nếu vẫn không ra kết quả:**

### **1. Kiểm tra database:**
```sql
-- Xem có rooms nào không
SELECT * FROM rooms WHERE is_available = true;

-- Xem có rooms ở Đà Lạt không
SELECT * FROM rooms 
WHERE is_available = true 
AND (
  lower(city) LIKE '%da lat%' OR
  lower(city) LIKE '%đà lạt%' OR
  lower(location) LIKE '%da lat%' OR
  lower(location) LIKE '%đà lạt%'
);
```

### **2. Test normalize function:**
```sql
-- Test normalize function
SELECT normalize_vietnamese_text('Đà Lạt');
-- Kết quả: "da lat"

SELECT normalize_vietnamese_text('Da Lat');
-- Kết quả: "da lat"
```

### **3. Test từng bước:**
```sql
-- Test 1: Chỉ search theo city
SELECT * FROM rooms 
WHERE is_available = true 
AND lower(city) LIKE '%da lat%';

-- Test 2: Test với normalize
SELECT * FROM rooms 
WHERE is_available = true 
AND normalize_vietnamese_text(city) LIKE '%da lat%';
```

## ✅ **Nếu vẫn có vấn đề:**

### **1. Kiểm tra data:**
- Có rooms trong database không?
- Rooms có `is_available = true` không?
- City/location có chứa "Đà Lạt" hoặc "Da Lat" không?

### **2. Kiểm tra function:**
- Function `normalize_vietnamese_text` có hoạt động không?
- Function `search_rooms_nearby` có được tạo thành công không?

### **3. Test đơn giản:**
```sql
-- Test search tất cả rooms
SELECT * FROM search_rooms_nearby();

-- Test search với term đơn giản
SELECT * FROM search_rooms_nearby(
  search_term := 'test'
);
```

## 🎯 **Kết luận:**

**RPC function đã được sửa để:**
- ✅ Không bắt buộc coordinates
- ✅ Chỉ cần search_term
- ✅ Xử lý tiếng Việt đầy đủ
- ✅ Tìm được tất cả format

**Test ngay và cho biết kết quả! 🚀**
