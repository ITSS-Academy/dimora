# 🔍 Vietnamese Search Guide - Hướng dẫn tìm kiếm tiếng Việt

## 🎯 **RPC Function đã được cập nhật với xử lý tiếng Việt!**

### **✅ Tính năng mới:**

#### **1. Normalize Vietnamese Text:**
```sql
-- Function bỏ dấu tiếng Việt
CREATE OR REPLACE FUNCTION normalize_vietnamese_text(input_text TEXT)
RETURNS TEXT
```

#### **2. Search với nhiều cách:**
- **Exact match**: "Đà Lạt" = "Đà Lạt"
- **Case insensitive**: "da lat" = "Da Lat"
- **Normalized match**: "dalat" = "Đà Lạt" (bỏ dấu)

#### **3. Search Score:**
- **100**: Exact match city
- **90**: Exact match location
- **80**: Exact match address
- **70**: Partial match city
- **60**: Partial match location
- **50**: Partial match address
- **40**: Normalized match city
- **30**: Normalized match location
- **20**: Normalized match address

## 🚀 **Cách sử dụng:**

### **1. Service Call:**
```typescript
const { data, error } = await this.supabaseService.getClient()
  .rpc('search_rooms_nearby', {
    lat_param: coordinates.latitude,
    lng_param: coordinates.longitude,
    search_term: params.location,  // ← Thêm search term
    // ... other params
  });
```

### **2. API Call:**
```bash
GET /rooms/search?location=Đà Lạt&guests=2&minPrice=300000
```

## 🔍 **Các trường hợp tìm kiếm:**

### **1. Tìm kiếm "Đà Lạt":**
```typescript
location: "Đà Lạt"
// Sẽ tìm được:
// - city: "Đà Lạt" ✅
// - location: "Trung tâm Đà Lạt" ✅
// - address: "123 Đường Đà Lạt" ✅
```

### **2. Tìm kiếm "da lat":**
```typescript
location: "da lat"
// Sẽ tìm được:
// - city: "Đà Lạt" ✅ (case insensitive)
// - location: "Trung tâm Đà Lạt" ✅
// - address: "123 Đường Đà Lạt" ✅
```

### **3. Tìm kiếm "dalat":**
```typescript
location: "dalat"
// Sẽ tìm được:
// - city: "Đà Lạt" ✅ (normalized match)
// - location: "Trung tâm Đà Lạt" ✅
// - address: "123 Đường Đà Lạt" ✅
```

## 📊 **Ví dụ kết quả:**

### **Search với `location: "da lat"`:**
```json
[
  {
    "id": "room-1",
    "title": "Phòng đẹp ở Đà Lạt",
    "city": "Đà Lạt",
    "location": "Trung tâm Đà Lạt",
    "address": "123 Đường Đà Lạt",
    "search_score": 100,  // ← Exact match city
    "distance_km": 2.5
  },
  {
    "id": "room-2",
    "title": "Phòng view núi",
    "city": "Đà Lạt",
    "location": "Gần Hồ Xuân Hương",
    "address": "456 Đường Đà Lạt",
    "search_score": 70,   // ← Partial match city
    "distance_km": 3.1
  }
]
```

## 🎯 **Test Cases:**

### **Test 1: Search "Đà Lạt"**
```sql
SELECT * FROM search_rooms_nearby(
  lat_param := 11.9404,
  lng_param := 108.4583,
  search_term := 'Đà Lạt'
);
```

### **Test 2: Search "da lat"**
```sql
SELECT * FROM search_rooms_nearby(
  lat_param := 11.9404,
  lng_param := 108.4583,
  search_term := 'da lat'
);
```

### **Test 3: Search "dalat"**
```sql
SELECT * FROM search_rooms_nearby(
  lat_param := 11.9404,
  lng_param := 108.4583,
  search_term := 'dalat'
);
```

## 🔧 **Normalize Function:**

### **Chuyển đổi:**
```sql
-- Input: "Đà Lạt"
-- Output: "da lat"

-- Input: "Hồ Chí Minh"
-- Output: "ho chi minh"

-- Input: "Hà Nội"
-- Output: "ha noi"
```

### **Bảng chuyển đổi:**
```
àáạảãâầấậẩẫăằắặẳẵ → a
èéẹẻẽêềếệểễ → e
ìíịỉĩ → i
òóọỏõôồốộổỗơờớợởỡ → o
ùúụủũưừứựửữ → u
ỳýỵỷỹ → y
đ → d
```

## 🎨 **Frontend Usage:**

### **Search Component:**
```typescript
const SearchForm = () => {
  const [searchParams, setSearchParams] = useState({
    location: '',
    guests: 2,
    minPrice: 300000
  });

  const handleSearch = async () => {
    // User có thể nhập bất kỳ format nào
    // "Đà Lạt", "da lat", "dalat" đều được
    const response = await api.get('/rooms/search', {
      params: searchParams
    });
    setRooms(response.data);
  };

  return (
    <form onSubmit={handleSearch}>
      <input
        type="text"
        placeholder="Nhập địa điểm (VD: Đà Lạt, da lat, dalat)..."
        value={searchParams.location}
        onChange={(e) => setSearchParams({
          ...searchParams,
          location: e.target.value
        })}
      />
      {/* Other filters */}
    </form>
  );
};
```

## ✅ **Ưu điểm:**

### **1. User-friendly:**
- ✅ Nhập bất kỳ format nào đều được
- ✅ Không cần nhớ chính xác dấu
- ✅ Hỗ trợ cả tiếng Việt và không dấu

### **2. Smart Ranking:**
- ✅ Kết quả được sắp xếp theo độ chính xác
- ✅ Exact match được ưu tiên cao nhất
- ✅ Normalized match vẫn tìm được kết quả

### **3. Performance:**
- ✅ Xử lý ở database level
- ✅ Không cần geocoding cho text search
- ✅ Kết hợp với distance calculation

## 🎯 **Kết luận:**

**Bây giờ search sẽ hoạt động với tất cả format:**
- ✅ "Đà Lạt" → Tìm được
- ✅ "da lat" → Tìm được  
- ✅ "dalat" → Tìm được
- ✅ "Da Lat" → Tìm được

**User experience được cải thiện đáng kể! 🎯**
