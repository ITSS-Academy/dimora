# 🔍 Debug Search Guide - Hướng dẫn debug

## 🎯 **Chạy từng bước để tìm vấn đề:**

### **1. Kiểm tra data cơ bản:**
```sql
-- Xem có rooms nào không
SELECT COUNT(*) as total_rooms FROM rooms;

-- Xem có rooms available không
SELECT COUNT(*) as available_rooms FROM rooms WHERE is_available = true;
```

### **2. Kiểm tra normalize function:**
```sql
-- Test normalize function
SELECT normalize_vietnamese_text('Đà Lạt') as normalized_da_lat;
SELECT normalize_vietnamese_text('Da Lat') as normalized_da_lat_2;
```

### **3. Kiểm tra search trực tiếp:**
```sql
-- Tìm rooms có chứa "da lat"
SELECT id, title, city, location, address 
FROM rooms 
WHERE is_available = true 
AND (
  lower(city) LIKE '%da lat%' OR
  lower(city) LIKE '%đà lạt%' OR
  lower(location) LIKE '%da lat%' OR
  lower(location) LIKE '%đà lạt%'
);
```

### **4. Test function đơn giản:**
```sql
-- Test function đơn giản
SELECT * FROM simple_search_rooms('da lat');
SELECT * FROM simple_search_rooms('Đà Lạt');
SELECT * FROM simple_search_rooms('test');
```

### **5. Test function phức tạp:**
```sql
-- Test function đầy đủ
SELECT * FROM search_rooms_nearby();
SELECT * FROM search_rooms_nearby(search_term := 'da lat');
```

## 🔍 **Các vấn đề có thể gặp:**

### **1. Không có data:**
```sql
-- Nếu COUNT = 0
SELECT COUNT(*) FROM rooms;
-- → Cần insert test data
```

### **2. Rooms không available:**
```sql
-- Nếu available_rooms = 0
SELECT COUNT(*) FROM rooms WHERE is_available = true;
-- → Cần set is_available = true
```

### **3. Function chưa được tạo:**
```sql
-- Test function có tồn tại không
SELECT * FROM search_rooms_nearby();
-- → Nếu lỗi: Cần tạo lại function
```

### **4. Data không match:**
```sql
-- Xem data thực tế
SELECT DISTINCT city, location FROM rooms WHERE is_available = true;
-- → Kiểm tra format data
```

## 🚀 **Test từng bước:**

### **Step 1: Kiểm tra data**
```sql
SELECT COUNT(*) FROM rooms;
SELECT COUNT(*) FROM rooms WHERE is_available = true;
```

### **Step 2: Xem data thực tế**
```sql
SELECT id, title, city, location, address, is_available 
FROM rooms 
LIMIT 5;
```

### **Step 3: Test search trực tiếp**
```sql
SELECT * FROM rooms 
WHERE is_available = true 
AND lower(city) LIKE '%da lat%';
```

### **Step 4: Test function đơn giản**
```sql
SELECT * FROM simple_search_rooms('da lat');
```

### **Step 5: Test function đầy đủ**
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
    "is_available": true
  }
]
```

### **Nếu không có data:**
```json
[]
```

## 🎯 **Nếu vẫn không ra:**

### **1. Insert test data:**
```sql
INSERT INTO rooms (
  id, title, city, location, address, 
  price_per_night, max_guests, host_id, 
  room_type_id, is_available
) VALUES (
  gen_random_uuid(), 'Phòng test Đà Lạt', 'Đà Lạt', 
  'Trung tâm Đà Lạt', '123 Đường Đà Lạt',
  500000, 2, 'host-uuid-here', 
  'room-type-uuid-here', true
);
```

### **2. Test lại:**
```sql
SELECT * FROM simple_search_rooms('da lat');
```

## ✅ **Kết luận:**

**Chạy từng bước debug để tìm vấn đề:**
1. ✅ Kiểm tra có data không
2. ✅ Kiểm tra data format
3. ✅ Test search trực tiếp
4. ✅ Test function đơn giản
5. ✅ Test function đầy đủ

**Cho biết kết quả từng bước! 🔍**
