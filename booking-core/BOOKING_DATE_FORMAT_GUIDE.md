# 📅 Booking API - Date Format Guide

## 🎯 Format cho `check_in_date` và `check_out_date`

### **✅ Định dạng đúng:**
```typescript
check_in_date: "2025-01-15"   // YYYY-MM-DD
check_out_date: "2025-01-20"  // YYYY-MM-DD
```

### **❌ Định dạng sai:**
```typescript
check_in_date: "15/01/2025"   // DD/MM/YYYY
check_out_date: "01/20/2025"  // MM/DD/YYYY
check_in_date: "2025-1-5"     // Thiếu số 0
check_out_date: "Jan 15, 2025" // Text format
```

## 🔍 Validation Rules

### **1. Create Booking DTO:**
```typescript
export class CreateBookingDto {
  @IsUUID()
  room_id: string;

  @IsDateString()  // ← Validate format YYYY-MM-DD
  check_in_date: string;

  @IsDateString()  // ← Validate format YYYY-MM-DD
  check_out_date: string;

  @IsNumber()
  @Min(1)
  guest_count: number;

  // ... other fields
}
```

### **2. Update Booking DTO:**
```typescript
export class UpdateBookingDto extends PartialType(CreateBookingDto) {
  // Inherits all validations from CreateBookingDto
  // check_in_date and check_out_date are optional but still validated
}
```

## 🚀 Test Examples

### **Test 1: Create Booking**
```bash
POST /bookings
Content-Type: application/json

{
  "room_id": "550e8400-e29b-41d4-a716-446655440000",
  "check_in_date": "2025-01-15",
  "check_out_date": "2025-01-20",
  "guest_count": 2,
  "guest_notes": "Check-in sớm nếu có thể"
}
```

### **Test 2: Update Booking**
```bash
PATCH /bookings/booking-id
Content-Type: application/json

{
  "check_in_date": "2025-01-16",
  "check_out_date": "2025-01-21",
  "guest_count": 3
}
```

### **Test 3: Create Booking với tất cả fields**
```bash
POST /bookings
Content-Type: application/json

{
  "room_id": "550e8400-e29b-41d4-a716-446655440000",
  "check_in_date": "2025-01-15",
  "check_out_date": "2025-01-20",
  "guest_count": 2,
  "guest_notes": "Check-in sớm nếu có thể",
  "user_id": "user-uuid-here",
  "host_id": "host-uuid-here",
  "total_amount": 2500000,
  "status": "pending"
}
```

## 🎨 Frontend Usage

### **Create Booking Form:**
```typescript
const CreateBookingForm = () => {
  const [bookingData, setBookingData] = useState({
    room_id: '',
    check_in_date: '',
    check_out_date: '',
    guest_count: 1,
    guest_notes: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await api.post('/bookings', bookingData);
      console.log('Booking created:', response.data);
    } catch (error) {
      console.error('Booking error:', error.response.data);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Room ID"
        value={bookingData.room_id}
        onChange={(e) => setBookingData({
          ...bookingData,
          room_id: e.target.value
        })}
      />
      
      <input
        type="date"  // ← HTML5 date input
        value={bookingData.check_in_date}
        onChange={(e) => setBookingData({
          ...bookingData,
          check_in_date: e.target.value  // Tự động format YYYY-MM-DD
        })}
      />
      
      <input
        type="date"  // ← HTML5 date input
        value={bookingData.check_out_date}
        onChange={(e) => setBookingData({
          ...bookingData,
          check_out_date: e.target.value  // Tự động format YYYY-MM-DD
        })}
      />
      
      <input
        type="number"
        min="1"
        value={bookingData.guest_count}
        onChange={(e) => setBookingData({
          ...bookingData,
          guest_count: parseInt(e.target.value)
        })}
      />
      
      <textarea
        placeholder="Ghi chú..."
        value={bookingData.guest_notes}
        onChange={(e) => setBookingData({
          ...bookingData,
          guest_notes: e.target.value
        })}
      />
      
      <button type="submit">Create Booking</button>
    </form>
  );
};
```

### **Date Picker Library (React):**
```typescript
import DatePicker from 'react-datepicker';

const CreateBookingForm = () => {
  const [bookingData, setBookingData] = useState({
    room_id: '',
    check_in_date: null,
    check_out_date: null,
    guest_count: 1,
    guest_notes: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const submitData = {
      ...bookingData,
      check_in_date: bookingData.check_in_date?.toISOString().split('T')[0],
      check_out_date: bookingData.check_out_date?.toISOString().split('T')[0]
    };
    
    try {
      const response = await api.post('/bookings', submitData);
      console.log('Booking created:', response.data);
    } catch (error) {
      console.error('Booking error:', error.response.data);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Room ID"
        value={bookingData.room_id}
        onChange={(e) => setBookingData({
          ...bookingData,
          room_id: e.target.value
        })}
      />
      
      <DatePicker
        selected={bookingData.check_in_date}
        onChange={(date) => setBookingData({
          ...bookingData,
          check_in_date: date
        })}
        dateFormat="yyyy-MM-dd"
        placeholderText="Check-in date"
        minDate={new Date()}  // Không cho chọn ngày trong quá khứ
      />
      
      <DatePicker
        selected={bookingData.check_out_date}
        onChange={(date) => setBookingData({
          ...bookingData,
          check_out_date: date
        })}
        dateFormat="yyyy-MM-dd"
        placeholderText="Check-out date"
        minDate={bookingData.check_in_date || new Date()}  // Phải sau check-in
      />
      
      <input
        type="number"
        min="1"
        value={bookingData.guest_count}
        onChange={(e) => setBookingData({
          ...bookingData,
          guest_count: parseInt(e.target.value)
        })}
      />
      
      <textarea
        placeholder="Ghi chú..."
        value={bookingData.guest_notes}
        onChange={(e) => setBookingData({
          ...bookingData,
          guest_notes: e.target.value
        })}
      />
      
      <button type="submit">Create Booking</button>
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
    "check_in_date must be a valid ISO 8601 date string",
    "check_out_date must be a valid ISO 8601 date string"
  ]
}
```

### **Invalid Date Format:**
```json
{
  "statusCode": 400,
  "message": "Failed to create booking: invalid input syntax for type date: \"15/01/2025\""
}
```

### **Date Logic Error:**
```json
{
  "statusCode": 400,
  "message": "check_out_date must be after check_in_date"
}
```

## 📋 Date Validation Logic

### **1. Format Validation:**
```typescript
@IsDateString()
check_in_date: string;  // Must be YYYY-MM-DD
```

### **2. Business Logic Validation:**
```typescript
// Trong service
if (new Date(check_in_date) >= new Date(check_out_date)) {
  throw new HttpException(
    'check_out_date must be after check_in_date',
    HttpStatus.BAD_REQUEST
  );
}

if (new Date(check_in_date) < new Date()) {
  throw new HttpException(
    'check_in_date cannot be in the past',
    HttpStatus.BAD_REQUEST
  );
}
```

### **3. Database Constraint:**
```sql
-- Trong database trigger
CREATE OR REPLACE FUNCTION check_booking_conflicts()
RETURNS TRIGGER AS $$
BEGIN
  -- Check for overlapping bookings
  IF EXISTS (
    SELECT 1 FROM bookings 
    WHERE room_id = NEW.room_id
    AND check_in_date < NEW.check_out_date
    AND check_out_date > NEW.check_in_date
    AND status IN ('pending', 'confirmed', 'in_progress')
    AND id != NEW.id
  ) THEN
    RAISE EXCEPTION 'Room is not available for the selected dates';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

## 🎯 Summary

### **✅ Đúng:**
- Format: `YYYY-MM-DD`
- Validation: `@IsDateString()`
- Business logic: check_out > check_in
- Database: DATE type

### **❌ Sai:**
- Format: `DD/MM/YYYY`, `MM/DD/YYYY`
- No validation
- check_out <= check_in
- Past dates

### **🎯 Best Practice:**
- Dùng HTML5 `<input type="date">`
- Hoặc date picker library với format `yyyy-MM-dd`
- Validate business logic trong service
- Check availability trước khi create booking

**Đảm bảo format date đúng cho cả Search và Booking API! 📅**
