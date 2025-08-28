# Booking Conflict Prevention

## 🚨 **Vấn đề với Unique Constraint đơn giản:**

Constraint ban đầu:
```sql
CONSTRAINT unique_room_booking_period UNIQUE (room_id, check_in_date, check_out_date, status)
```

**Vấn đề:** Chỉ ngăn chặn booking có **exact same** check_in_date, check_out_date, status. Nhưng không ngăn được booking **overlap** (trùng lịch).

## 📅 **Ví dụ trùng lịch vẫn xảy ra:**

### **Booking 1:**
- `room_id`: room-123
- `check_in_date`: 2024-10-10
- `check_out_date`: 2024-10-15
- `status`: confirmed

### **Booking 2 (VẪN ĐƯỢC TẠO!):**
- `room_id`: room-123
- `check_in_date`: 2024-10-12 ← **Trùng với Booking 1**
- `check_out_date`: 2024-10-17
- `status`: confirmed

→ Booking 2 vẫn được tạo vì có `check_in_date` khác!

## ✅ **Giải pháp đúng - Trigger Function:**

```sql
CREATE OR REPLACE FUNCTION check_booking_conflicts()
RETURNS TRIGGER AS $$
DECLARE
    conflicting_bookings INTEGER;
BEGIN
    -- Kiểm tra overlap: A.start < B.end AND A.end > B.start
    SELECT COUNT(*) INTO conflicting_bookings
    FROM bookings
    WHERE room_id = NEW.room_id
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
      AND check_in_date < NEW.check_out_date
      AND check_out_date > NEW.check_in_date
      AND status IN ('pending', 'confirmed', 'in_progress', 'completed');
    
    IF conflicting_bookings > 0 AND NEW.status IN ('pending', 'confirmed', 'in_progress', 'completed') THEN
        RAISE EXCEPTION 'Room is not available for the selected dates. There are % conflicting bookings.', conflicting_bookings;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

## 🔍 **Logic kiểm tra overlap:**

### **Công thức overlap:**
```
Booking A overlaps with Booking B if:
A.start < B.end AND A.end > B.start
```

### **Ví dụ minh họa:**

**Booking A:** 10/10 - 15/10
**Booking B:** 12/10 - 17/10

**Kiểm tra:**
- A.start (10/10) < B.end (17/10) ✅
- A.end (15/10) > B.start (12/10) ✅
- → **OVERLAP!** ❌

## 📊 **Các trường hợp được kiểm tra:**

### **1. Trùng lịch hoàn toàn:**
```
Booking 1: 10/10 - 15/10
Booking 2: 10/10 - 15/10  ← BLOCKED
```

### **2. Trùng lịch một phần:**
```
Booking 1: 10/10 - 15/10
Booking 2: 12/10 - 17/10  ← BLOCKED
```

### **3. Trùng lịch chứa:**
```
Booking 1: 10/10 - 15/10
Booking 2: 12/10 - 14/10  ← BLOCKED
```

### **4. Trùng lịch bị chứa:**
```
Booking 1: 10/10 - 15/10
Booking 2: 08/10 - 17/10  ← BLOCKED
```

### **5. Không trùng lịch:**
```
Booking 1: 10/10 - 15/10
Booking 2: 16/10 - 20/10  ← ALLOWED
```

## 🎯 **Status được kiểm tra:**

### **Active Status (ngăn trùng lịch):**
- `pending`
- `confirmed`
- `in_progress`
- `completed`

### **Inactive Status (cho phép trùng lịch):**
- `cancelled`
- `no_show`
- `refunded`
- `disputed`

## 🧪 **Test Cases:**

### **Test 1: Tạo booking đầu tiên**
```sql
INSERT INTO bookings (room_id, user_id, host_id, check_in_date, check_out_date, guest_count, total_amount, status)
VALUES ('room-123', 'user-1', 'host-1', '2024-10-10', '2024-10-15', 2, 1000000, 'confirmed');
-- ✅ SUCCESS
```

### **Test 2: Tạo booking trùng lịch**
```sql
INSERT INTO bookings (room_id, user_id, host_id, check_in_date, check_out_date, guest_count, total_amount, status)
VALUES ('room-123', 'user-2', 'host-1', '2024-10-12', '2024-10-17', 2, 1000000, 'confirmed');
-- ❌ ERROR: Room is not available for the selected dates. There are 1 conflicting bookings.
```

### **Test 3: Tạo booking với status cancelled**
```sql
INSERT INTO bookings (room_id, user_id, host_id, check_in_date, check_out_date, guest_count, total_amount, status)
VALUES ('room-123', 'user-2', 'host-1', '2024-10-12', '2024-10-17', 2, 1000000, 'cancelled');
-- ✅ SUCCESS (cancelled không tính là conflict)
```

### **Test 4: Tạo booking không trùng lịch**
```sql
INSERT INTO bookings (room_id, user_id, host_id, check_in_date, check_out_date, guest_count, total_amount, status)
VALUES ('room-123', 'user-2', 'host-1', '2024-10-16', '2024-10-20', 2, 1000000, 'confirmed');
-- ✅ SUCCESS
```

## 🔧 **Cách hoạt động:**

1. **Khi INSERT booking mới:** Trigger kiểm tra xem có booking nào active trùng lịch không
2. **Khi UPDATE booking:** Trigger kiểm tra xem việc update có tạo ra conflict không
3. **Nếu có conflict:** Throw exception với thông báo rõ ràng
4. **Nếu không conflict:** Cho phép insert/update

## 💡 **Lợi ích:**

- ✅ **Ngăn chặn hoàn toàn** trùng lịch booking
- ✅ **Thông báo lỗi rõ ràng** cho developer
- ✅ **Tự động kiểm tra** mọi insert/update
- ✅ **Linh hoạt** với status khác nhau
- ✅ **Performance tốt** với index trên room_id và dates

## 🚀 **Sử dụng trong API:**

Khi API trả về lỗi:
```json
{
  "error": "Room is not available for the selected dates. There are 1 conflicting bookings.",
  "statusCode": 400
}
```

Frontend có thể hiển thị: "Phòng đã được đặt trong khoảng thời gian này!"
