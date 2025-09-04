# 📅 Search API - Date Format Guide

## 🎯 Format cho `checkIn` và `checkOut`

### **✅ Định dạng đúng:**
```typescript
checkIn: "2025-01-15"   // YYYY-MM-DD
checkOut: "2025-01-20"  // YYYY-MM-DD
```

### **❌ Định dạng sai:**
```typescript
checkIn: "15/01/2025"   // DD/MM/YYYY
checkOut: "01/20/2025"  // MM/DD/YYYY
checkIn: "2025-1-5"     // Thiếu số 0
checkOut: "Jan 15, 2025" // Text format
```

## 🔍 Validation Rules

### **1. DTO Validation:**
```typescript
@IsOptional()
@IsString()
@IsDateString()
checkIn?: string; // Format: YYYY-MM-DD

@IsOptional()
@IsString()
@IsDateString()
checkOut?: string; // Format: YYYY-MM-DD
```

### **2. Service Processing:**
```typescript
// Frontend gửi string → Backend validate → RPC nhận DATE
const { data, error } = await this.supabaseService.getClient()
  .rpc('search_rooms_nearby', {
    lat_param: coordinates.latitude,
    lng_param: coordinates.longitude,
    check_in_date_param: params.checkIn || null,  // String → DATE
    check_out_date_param: params.checkOut || null, // String → DATE
    // ...
  });
```

### **3. RPC Function:**
```sql
CREATE OR REPLACE FUNCTION search_rooms_nearby(
  lat_param NUMERIC,
  lng_param NUMERIC,
  check_in_date_param DATE DEFAULT NULL,   -- Nhận DATE type
  check_out_date_param DATE DEFAULT NULL,  -- Nhận DATE type
  -- ...
)
```

## 🚀 Test Examples

### **Test 1: Search với dates**
```bash
GET /rooms/search?location=Q1&checkIn=2025-01-15&checkOut=2025-01-20&guests=2
```

### **Test 2: Search không có dates**
```bash
GET /rooms/search?location=Q1&guests=2
```

### **Test 3: Search chỉ có checkIn**
```bash
GET /rooms/search?location=Q1&checkIn=2025-01-15
```

## 🎨 Frontend Usage

### **Date Input Component:**
```typescript
const SearchForm = () => {
  const [searchParams, setSearchParams] = useState({
    location: '',
    checkIn: '',
    checkOut: '',
    guests: 2
  });

  const handleSearch = async () => {
    const response = await api.get('/rooms/search', {
      params: searchParams
    });
    setRooms(response.data);
  };

  return (
    <form onSubmit={handleSearch}>
      <input
        type="text"
        placeholder="Địa chỉ..."
        value={searchParams.location}
        onChange={(e) => setSearchParams({
          ...searchParams,
          location: e.target.value
        })}
      />
      
      <input
        type="date"  // ← HTML5 date input
        value={searchParams.checkIn}
        onChange={(e) => setSearchParams({
          ...searchParams,
          checkIn: e.target.value  // Tự động format YYYY-MM-DD
        })}
      />
      
      <input
        type="date"  // ← HTML5 date input
        value={searchParams.checkOut}
        onChange={(e) => setSearchParams({
          ...searchParams,
          checkOut: e.target.value  // Tự động format YYYY-MM-DD
        })}
      />
      
      <button type="submit">Search</button>
    </form>
  );
};
```

### **Date Picker Library (React):**
```typescript
import DatePicker from 'react-datepicker';

const SearchForm = () => {
  const [searchParams, setSearchParams] = useState({
    location: '',
    checkIn: null,
    checkOut: null,
    guests: 2
  });

  const handleSearch = async () => {
    const params = {
      ...searchParams,
      checkIn: searchParams.checkIn?.toISOString().split('T')[0], // Convert to YYYY-MM-DD
      checkOut: searchParams.checkOut?.toISOString().split('T')[0] // Convert to YYYY-MM-DD
    };
    
    const response = await api.get('/rooms/search', { params });
    setRooms(response.data);
  };

  return (
    <form onSubmit={handleSearch}>
      <input
        type="text"
        placeholder="Địa chỉ..."
        value={searchParams.location}
        onChange={(e) => setSearchParams({
          ...searchParams,
          location: e.target.value
        })}
      />
      
      <DatePicker
        selected={searchParams.checkIn}
        onChange={(date) => setSearchParams({
          ...searchParams,
          checkIn: date
        })}
        dateFormat="yyyy-MM-dd"  // Format output
        placeholderText="Check-in date"
      />
      
      <DatePicker
        selected={searchParams.checkOut}
        onChange={(date) => setSearchParams({
          ...searchParams,
          checkOut: date
        })}
        dateFormat="yyyy-MM-dd"  // Format output
        placeholderText="Check-out date"
      />
      
      <button type="submit">Search</button>
    </form>
  );
};
```

## 🔧 Error Handling

### **Validation Error:**
```json
{
  "statusCode": 400,
  "message": [
    "checkIn must be a valid ISO 8601 date string"
  ]
}
```

### **Invalid Date Format:**
```json
{
  "statusCode": 400,
  "message": "Failed to search rooms nearby: invalid input syntax for type date: \"15/01/2025\""
}
```

## 📋 Summary

### **✅ Đúng:**
- Format: `YYYY-MM-DD`
- Validation: `@IsDateString()`
- Type: `string` → `DATE`

### **❌ Sai:**
- Format: `DD/MM/YYYY`, `MM/DD/YYYY`
- No validation
- Type mismatch

### **🎯 Best Practice:**
- Dùng HTML5 `<input type="date">`
- Hoặc date picker library với format `yyyy-MM-dd`
- Validate trước khi gửi request

**Đảm bảo format date đúng để tránh lỗi! 📅**
