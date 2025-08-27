# 🚀 Setup Guide - Không sử dụng PostGIS

## 📋 Tổng quan

Hướng dẫn setup RPC function search rooms **KHÔNG sử dụng PostGIS**, chỉ dùng PostgreSQL native functions với công thức Haversine để tính khoảng cách.

## 🔧 Setup Steps

### **Bước 1: Tạo RPC Function**
```sql
-- Chạy file search_rooms_no_postgis.sql
-- File này chứa:
-- 1. Function calculate_distance_km() - Tính khoảng cách bằng Haversine
-- 2. Function search_rooms_nearby() - Search rooms với JSON return
```

### **Bước 2: Tạo Indexes**
```sql
-- Chạy file create_simple_indexes.sql
-- File này tạo các indexes cần thiết (không cần PostGIS)
```

### **Bước 3: Test Function**
```sql
-- Test với coordinates TP.HCM
SELECT * FROM search_rooms_nearby(
  lat := 10.762622,
  lng := 106.660172,
  radius_km := 10
);
```

## 🎯 Files cần chạy

### **1. search_rooms_no_postgis.sql**
- ✅ RPC function hoàn chỉnh
- ✅ Không cần PostGIS extension
- ✅ Sử dụng Haversine formula
- ✅ Trả về JSON

### **2. create_simple_indexes.sql**
- ✅ Indexes cho performance
- ✅ Không cần PostGIS
- ✅ Kiểm tra bảng tồn tại

## 🔍 Cách hoạt động

### **Distance Calculation (Haversine):**
```sql
-- Công thức Haversine để tính khoảng cách trên Trái Đất
a = sin²(Δφ/2) + cos(φ1) * cos(φ2) * sin²(Δλ/2)
c = 2 * atan2(√a, √(1-a))
distance = R * c
```

### **Performance:**
- ✅ **Fast**: Sử dụng indexes thông thường
- ✅ **Accurate**: Haversine formula chính xác
- ✅ **Compatible**: Hoạt động với PostgreSQL thông thường

## 🚨 Lưu ý

### **1. Không cần PostGIS:**
- ❌ Không cần `CREATE EXTENSION postgis;`
- ❌ Không cần spatial indexes
- ✅ Hoạt động với PostgreSQL thông thường

### **2. Performance:**
- ⚠️ **Chậm hơn PostGIS** một chút với dataset lớn
- ✅ **Đủ nhanh** cho hầu hết use cases
- ✅ **Dễ maintain** hơn

### **3. Accuracy:**
- ✅ **Chính xác** cho khoảng cách < 1000km
- ✅ **Đủ tốt** cho search rooms

## 🎯 Test Cases

### **Test 1: Basic Search**
```sql
SELECT * FROM search_rooms_nearby(
  lat := 10.762622,
  lng := 106.660172,
  radius_km := 10
);
```

### **Test 2: Search with Dates**
```sql
SELECT * FROM search_rooms_nearby(
  lat := 10.762622,
  lng := 106.660172,
  check_in_date := '2025-01-15',
  check_out_date := '2025-01-17',
  radius_km := 10
);
```

### **Test 3: Search with Filters**
```sql
SELECT * FROM search_rooms_nearby(
  lat := 10.762622,
  lng := 106.660172,
  radius_km := 10,
  max_guests := 2,
  min_price := 300000,
  max_price := 800000
);
```

## 🔧 Troubleshooting

### **Error: "function calculate_distance_km does not exist"**
```sql
-- Chạy lại file search_rooms_no_postgis.sql
-- Đảm bảo function được tạo trước
```

### **Error: "relation rooms does not exist"**
```sql
-- Tạo bảng rooms trước
-- Chạy rooms_table.sql
```

### **Error: "permission denied"**
```sql
-- Kiểm tra user có quyền tạo functions
-- Hoặc chạy với superuser
```

## 🚀 Benefits

### **1. Compatibility:**
- ✅ Hoạt động với PostgreSQL thông thường
- ✅ Không cần extensions đặc biệt
- ✅ Dễ deploy

### **2. Maintainability:**
- ✅ Code đơn giản, dễ hiểu
- ✅ Ít dependencies
- ✅ Dễ debug

### **3. Performance:**
- ✅ Đủ nhanh cho search rooms
- ✅ Indexes tối ưu
- ✅ JSON return format

**Setup này hoạt động ngay lập tức mà không cần PostGIS! 🎯**
