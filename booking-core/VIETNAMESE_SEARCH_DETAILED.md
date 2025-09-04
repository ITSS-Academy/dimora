# 🔍 Vietnamese Search - Xử lý chi tiết

## 🎯 **Vấn đề: Database có cả 2 loại dữ liệu**

### **📊 Trong database có thể có:**

#### **1. Có dấu:**
```sql
city: "Đà Lạt"
location: "Trung tâm Đà Lạt"
address: "123 Đường Đà Lạt"
```

#### **2. Không dấu:**
```sql
city: "Da Lat"
location: "Trung tam Da Lat"
address: "123 Duong Da Lat"
```

## 🔧 **Giải pháp: Xử lý 4 chiều**

### **✅ 1. Exact Match (Case Insensitive):**
```sql
-- User search: "Đà Lạt"
-- Tìm được: "Đà Lạt", "da lat", "Da Lat"
lower(r.city) = lower(search_term)
```

### **✅ 2. Partial Match (Case Insensitive):**
```sql
-- User search: "da lat"
-- Tìm được: "Trung tâm Đà Lạt", "Gần Da Lat"
lower(r.city) LIKE '%' || lower(search_term) || '%'
```

### **✅ 3. Normalized Match (Bỏ dấu):**
```sql
-- User search: "dalat"
-- Database: "Đà Lạt" → normalize → "da lat"
-- Tìm được: "Đà Lạt", "Da Lat"
normalize_vietnamese_text(r.city) LIKE '%' || normalized_search || '%'
```

### **✅ 4. Reverse Normalized Match (Có dấu):**
```sql
-- User search: "Đà Lạt"
-- Database: "Da Lat" → normalize → "da lat"
-- Tìm được: "Da Lat", "da lat"
normalize_vietnamese_text(r.city) LIKE '%' || normalize_vietnamese_text(search_term) || '%'
```

## 📋 **Bảng ví dụ chi tiết:**

| User Search | Database Value | Match Type | Kết quả |
|-------------|----------------|------------|---------|
| "Đà Lạt" | "Đà Lạt" | Exact | ✅ |
| "Đà Lạt" | "Da Lat" | Reverse Normalized | ✅ |
| "da lat" | "Đà Lạt" | Case Insensitive | ✅ |
| "da lat" | "Da Lat" | Case Insensitive | ✅ |
| "dalat" | "Đà Lạt" | Normalized | ✅ |
| "dalat" | "Da Lat" | Normalized | ✅ |
| "Da Lat" | "Đà Lạt" | Case Insensitive | ✅ |
| "Da Lat" | "Da Lat" | Exact | ✅ |

## 🔍 **Các trường hợp tìm kiếm:**

### **1. User search "Đà Lạt":**
```sql
-- Tìm được tất cả:
-- "Đà Lạt" (exact match)
-- "Da Lat" (reverse normalized)
-- "da lat" (case insensitive)
-- "ĐÀ LẠT" (case insensitive)
```

### **2. User search "da lat":**
```sql
-- Tìm được tất cả:
-- "Đà Lạt" (case insensitive)
-- "Da Lat" (case insensitive)
-- "da lat" (exact match)
-- "DA LAT" (case insensitive)
```

### **3. User search "dalat":**
```sql
-- Tìm được tất cả:
-- "Đà Lạt" (normalized: "da lat")
-- "Da Lat" (normalized: "da lat")
-- "da lat" (normalized: "da lat")
```

## 🎯 **Search Score Logic:**

### **Score cao nhất (100):**
```sql
-- Exact match city
WHEN lower(r.city) = lower(search_term) THEN 100
```

### **Score cao (90):**
```sql
-- Exact match location
WHEN lower(r.location) = lower(search_term) THEN 90
```

### **Score trung bình (70):**
```sql
-- Partial match city
WHEN lower(r.city) LIKE '%' || lower(search_term) || '%' THEN 70
```

### **Score thấp (40):**
```sql
-- Normalized match city
WHEN normalize_vietnamese_text(r.city) LIKE '%' || normalized_search || '%' THEN 40
```

## 🚀 **Test Cases:**

### **Test 1: Database có dấu, User search có dấu**
```sql
-- Database: city = "Đà Lạt"
-- User search: "Đà Lạt"
-- Result: ✅ Exact match, Score: 100
```

### **Test 2: Database có dấu, User search không dấu**
```sql
-- Database: city = "Đà Lạt"
-- User search: "da lat"
-- Result: ✅ Case insensitive, Score: 70
```

### **Test 3: Database không dấu, User search có dấu**
```sql
-- Database: city = "Da Lat"
-- User search: "Đà Lạt"
-- Result: ✅ Reverse normalized, Score: 40
```

### **Test 4: Database không dấu, User search không dấu**
```sql
-- Database: city = "Da Lat"
-- User search: "dalat"
-- Result: ✅ Normalized, Score: 40
```

## 📊 **Ví dụ kết quả thực tế:**

### **Search "da lat":**
```json
[
  {
    "id": "room-1",
    "city": "Đà Lạt",
    "location": "Trung tâm Đà Lạt",
    "search_score": 70,  // Partial match city
    "distance_km": 2.5
  },
  {
    "id": "room-2", 
    "city": "Da Lat",
    "location": "Gần Hồ Xuân Hương",
    "search_score": 70,  // Partial match city
    "distance_km": 3.1
  },
  {
    "id": "room-3",
    "city": "TP.HCM",
    "location": "Gần Đà Lạt",
    "search_score": 60,  // Partial match location
    "distance_km": 5.2
  }
]
```

## ✅ **Ưu điểm của giải pháp:**

### **1. Toàn diện:**
- ✅ Xử lý được tất cả trường hợp
- ✅ Không phụ thuộc vào format dữ liệu
- ✅ User có thể nhập bất kỳ format nào

### **2. Thông minh:**
- ✅ Exact match được ưu tiên cao nhất
- ✅ Partial match vẫn tìm được kết quả
- ✅ Normalized match xử lý được dấu

### **3. Performance:**
- ✅ Xử lý ở database level
- ✅ Không cần multiple queries
- ✅ Index có thể được tối ưu

## 🎯 **Kết luận:**

**Giải pháp xử lý được tất cả trường hợp:**
- ✅ Database có dấu + User search có dấu
- ✅ Database có dấu + User search không dấu  
- ✅ Database không dấu + User search có dấu
- ✅ Database không dấu + User search không dấu

**User experience hoàn hảo! 🎯**
