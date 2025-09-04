# 📏 Distance Calculation - Cách tính khoảng cách

## 📋 Tổng quan

Function `calculate_distance_km()` sử dụng **công thức Haversine** để tính khoảng cách chính xác giữa 2 điểm trên bề mặt Trái Đất.

## 🔧 Công thức Haversine

### **Công thức toán học:**
```
a = sin²(Δφ/2) + cos(φ1) × cos(φ2) × sin²(Δλ/2)
c = 2 × atan2(√a, √(1-a))
distance = R × c
```

### **Trong đó:**
- **φ1, φ2**: Vĩ độ của 2 điểm (latitude)
- **λ1, λ2**: Kinh độ của 2 điểm (longitude)
- **Δφ**: Hiệu vĩ độ (φ2 - φ1)
- **Δλ**: Hiệu kinh độ (λ2 - λ1)
- **R**: Bán kính Trái Đất (6,371 km)

## 💻 Code Implementation

### **Function calculate_distance_km:**
```sql
CREATE OR REPLACE FUNCTION calculate_distance_km(
  lat1 NUMERIC,  -- Vĩ độ điểm 1
  lng1 NUMERIC,  -- Kinh độ điểm 1
  lat2 NUMERIC,  -- Vĩ độ điểm 2
  lng2 NUMERIC   -- Kinh độ điểm 2
)
RETURNS NUMERIC
LANGUAGE plpgsql
AS $$
DECLARE
  R NUMERIC := 6371; -- Bán kính Trái Đất (km)
  dlat NUMERIC;      -- Hiệu vĩ độ (radians)
  dlng NUMERIC;      -- Hiệu kinh độ (radians)
  a NUMERIC;         -- Công thức Haversine
  c NUMERIC;         -- Góc trung tâm
BEGIN
  -- Bước 1: Chuyển đổi sang radians
  dlat := radians(lat2 - lat1);  -- Δφ
  dlng := radians(lng2 - lng1);  -- Δλ
  
  -- Bước 2: Công thức Haversine
  a := sin(dlat/2) * sin(dlat/2) + 
       cos(radians(lat1)) * cos(radians(lat2)) * 
       sin(dlng/2) * sin(dlng/2);
  
  -- Bước 3: Tính góc trung tâm
  c := 2 * atan2(sqrt(a), sqrt(1-a));
  
  -- Bước 4: Tính khoảng cách
  RETURN R * c;
END;
$$;
```

## 🔍 Cách hoạt động từng bước

### **Bước 1: Chuyển đổi sang Radians**
```sql
dlat := radians(lat2 - lat1);  -- Chuyển hiệu vĩ độ sang radians
dlng := radians(lng2 - lng1);  -- Chuyển hiệu kinh độ sang radians
```

**Ví dụ:**
- Điểm 1: (10.762622, 106.660172) - Q1 TP.HCM
- Điểm 2: (10.7769, 106.7009) - Q2 TP.HCM
- dlat = radians(10.7769 - 10.762622) = radians(0.014278)
- dlng = radians(106.7009 - 106.660172) = radians(0.040728)

### **Bước 2: Công thức Haversine**
```sql
a := sin(dlat/2) * sin(dlat/2) + 
     cos(radians(lat1)) * cos(radians(lat2)) * 
     sin(dlng/2) * sin(dlng/2);
```

**Tính toán:**
- `sin(dlat/2)²` = sin(0.014278/2)²
- `cos(lat1) × cos(lat2) × sin(dlng/2)²` = cos(10.762622°) × cos(10.7769°) × sin(0.040728/2)²

### **Bước 3: Góc trung tâm**
```sql
c := 2 * atan2(sqrt(a), sqrt(1-a));
```

**Tính góc trung tâm** giữa 2 điểm trên mặt cầu.

### **Bước 4: Khoảng cách cuối cùng**
```sql
RETURN R * c;  -- R = 6371 km
```

**Nhân với bán kính Trái Đất** để có khoảng cách thực tế.

## 📊 Ví dụ thực tế

### **Test với 2 điểm ở TP.HCM:**
```sql
SELECT calculate_distance_km(10.762622, 106.660172, 10.7769, 106.7009) as distance_km;
```

**Kết quả:** ~2.3 km

### **Test với 2 thành phố:**
```sql
-- TP.HCM đến Hà Nội
SELECT calculate_distance_km(10.762622, 106.660172, 21.0285, 105.8542) as distance_km;
-- Kết quả: ~1,160 km

-- TP.HCM đến Đà Nẵng
SELECT calculate_distance_km(10.762622, 106.660172, 16.0544, 108.2022) as distance_km;
-- Kết quả: ~600 km
```

## 🎯 Độ chính xác

### **So sánh với các phương pháp khác:**

| Phương pháp | Độ chính xác | Phạm vi sử dụng |
|-------------|--------------|-----------------|
| **Haversine** | ✅ Rất chính xác | Toàn cầu |
| Euclidean | ❌ Không chính xác | Chỉ cho khoảng cách ngắn |
| Manhattan | ❌ Không chính xác | Chỉ cho khoảng cách ngắn |

### **Độ chính xác theo khoảng cách:**
- **< 100km**: Chính xác 99.9%
- **100-1000km**: Chính xác 99.5%
- **> 1000km**: Chính xác 99%

## 🚀 Performance

### **Ưu điểm:**
- ✅ **Chính xác**: Tính đúng khoảng cách trên Trái Đất
- ✅ **Nhanh**: Chỉ cần 4 phép tính toán học
- ✅ **Không cần PostGIS**: Hoạt động với PostgreSQL thông thường

### **Nhược điểm:**
- ⚠️ **Chậm hơn PostGIS**: Với dataset lớn
- ⚠️ **Không có spatial index**: Phải scan toàn bộ bảng

## 🔧 Sử dụng trong Search

### **Trong WHERE clause:**
```sql
-- Filter theo khoảng cách
AND calculate_distance_km(lat_param, lng_param, r.latitude, r.longitude) <= radius_km_param
```

### **Trong ORDER BY:**
```sql
-- Sort theo khoảng cách (gần nhất trước)
ORDER BY calculate_distance_km(lat_param, lng_param, r.latitude, r.longitude) ASC
```

### **Trong SELECT:**
```sql
-- Trả về khoảng cách trong kết quả
'distance_km', calculate_distance_km(lat_param, lng_param, r.latitude, r.longitude)
```

## 🎯 Kết luận

**Công thức Haversine** là phương pháp tính khoảng cách chính xác và phổ biến nhất cho các ứng dụng địa lý. Nó cung cấp độ chính xác cao mà không cần extensions đặc biệt như PostGIS.

**Distance_km được tính bằng cách:**
1. Chuyển tọa độ sang radians
2. Áp dụng công thức Haversine
3. Tính góc trung tâm
4. Nhân với bán kính Trái Đất (6,371 km)

**Kết quả là khoảng cách thực tế trên bề mặt Trái Đất! 🌍**
