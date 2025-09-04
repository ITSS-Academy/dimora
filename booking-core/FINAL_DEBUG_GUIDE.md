# 🔍 Final Debug Guide - Hướng dẫn debug cuối cùng

## 🎯 **Có 33 phòng nhưng search không ra!**

### **📋 Chạy từng bước để tìm vấn đề:**

#### **1. Kiểm tra data cơ bản:**
```sql
-- Xem tổng số rooms
SELECT COUNT(*) as total_rooms FROM rooms;

-- Xem rooms available
SELECT COUNT(*) as available_rooms FROM rooms WHERE is_available = true;

-- Xem sample data
SELECT id, title, city, location, address, is_available, latitude, longitude
FROM rooms 
LIMIT 5;
```

#### **2. Xem tất cả cities và locations:**
```sql
-- Xem tất cả cities có trong database
SELECT DISTINCT city FROM rooms WHERE is_available = true ORDER BY city;

-- Xem tất cả locations có trong database
SELECT DISTINCT location FROM rooms WHERE is_available = true ORDER BY location;
```

#### **3. Test search trực tiếp:**
```sql
-- Test search với "da lat"
SELECT id, title, city, location, address
FROM rooms 
WHERE is_available = true 
AND (
  lower(city) LIKE '%da lat%' OR
  lower(city) LIKE '%đà lạt%' OR
  lower(location) LIKE '%da lat%' OR
  lower(location) LIKE '%đà lạt%' OR
  lower(address) LIKE '%da lat%' OR
  lower(address) LIKE '%đà lạt%'
);

-- Test search với "vung tau"
SELECT id, title, city, location, address
FROM rooms 
WHERE is_available = true 
AND (
  lower(city) LIKE '%vung tau%' OR
  lower(city) LIKE '%vũng tàu%' OR
  lower(location) LIKE '%vung tau%' OR
  lower(location) LIKE '%vũng tàu%'
);

-- Test search với "ho chi minh"
SELECT id, title, city, location, address
FROM rooms 
WHERE is_available = true 
AND (
  lower(city) LIKE '%ho chi minh%' OR
  lower(city) LIKE '%hồ chí minh%' OR
  lower(location) LIKE '%ho chi minh%' OR
  lower(location) LIKE '%hồ chí minh%'
);
```

#### **4. Test normalize function:**
```sql
-- Test normalize function
SELECT 'Đà Lạt' as original, normalize_vietnamese_text('Đà Lạt') as normalized;
SELECT 'Vũng Tàu' as original, normalize_vietnamese_text('Vũng Tàu') as normalized;
SELECT 'Hồ Chí Minh' as original, normalize_vietnamese_text('Hồ Chí Minh') as normalized;
```

#### **5. Test RPC function:**
```sql
-- Test search tất cả rooms
SELECT * FROM search_rooms_nearby();

-- Test search với "da lat"
SELECT * FROM search_rooms_nearby(search_term := 'da lat');

-- Test search với "Đà Lạt"
SELECT * FROM search_rooms_nearby(search_term := 'Đà Lạt');

-- Test search với "vung tau"
SELECT * FROM search_rooms_nearby(search_term := 'vung tau');

-- Test search với "Vũng Tàu"
SELECT * FROM search_rooms_nearby(search_term := 'Vũng Tàu');
```

## 🔍 **Các vấn đề có thể gặp:**

### **1. Data format khác:**
```sql
-- Có thể data là:
city: "TP.HCM" thay vì "Hồ Chí Minh"
city: "TP.HCM" thay vì "Ho Chi Minh"
city: "VT" thay vì "Vũng Tàu"
city: "DL" thay vì "Đà Lạt"
```

### **2. Rooms không available:**
```sql
-- Kiểm tra is_available
SELECT COUNT(*) FROM rooms WHERE is_available = false;
```

### **3. Function chưa được tạo:**
```sql
-- Test function có tồn tại không
SELECT * FROM search_rooms_nearby();
```

### **4. Normalize function lỗi:**
```sql
-- Test normalize
SELECT normalize_vietnamese_text('Đà Lạt');
```

## 🚀 **Test từng bước:**

### **Step 1: Kiểm tra data**
```sql
SELECT COUNT(*) FROM rooms;
SELECT COUNT(*) FROM rooms WHERE is_available = true;
```

### **Step 2: Xem data thực tế**
```sql
SELECT DISTINCT city FROM rooms WHERE is_available = true;
SELECT DISTINCT location FROM rooms WHERE is_available = true;
```

### **Step 3: Test search trực tiếp**
```sql
SELECT * FROM rooms 
WHERE is_available = true 
AND lower(city) LIKE '%da lat%';
```

### **Step 4: Test RPC function**
```sql
SELECT * FROM search_rooms_nearby(search_term := 'da lat');
```

## 📊 **Expected Results:**

### **Nếu có data:**
```json
[
  {
    "id": "room-1",
    "title": "Phòng đẹp",
    "city": "Đà Lạt",
    "location": "Trung tâm",
    "search_score": 100
  }
]
```

### **Nếu không có data:**
```json
[]
```

## 🎯 **Nếu vẫn không ra:**

### **1. Kiểm tra data format:**
```sql
-- Xem data thực tế
SELECT id, title, city, location, address 
FROM rooms 
WHERE is_available = true 
LIMIT 10;
```

### **2. Test với term đơn giản:**
```sql
-- Test với "test"
SELECT * FROM search_rooms_nearby(search_term := 'test');

-- Test với "phòng"
SELECT * FROM search_rooms_nearby(search_term := 'phòng');
```

### **3. Test search tất cả:**
```sql
-- Test search tất cả rooms
SELECT * FROM search_rooms_nearby();
```

## ✅ **Kết luận:**

**Chạy từng bước debug để tìm vấn đề:**
1. ✅ Kiểm tra có 33 rooms không
2. ✅ Kiểm tra rooms có available không
3. ✅ Xem data format thực tế
4. ✅ Test search trực tiếp
5. ✅ Test RPC function

**Cho biết kết quả từng bước! 🔍**
