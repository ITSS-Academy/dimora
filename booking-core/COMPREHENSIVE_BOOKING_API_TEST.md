# Comprehensive Booking API Test

## 🚀 **Setup Database trước khi test:**

### **1. Tạo Users:**
```http
POST http://localhost:3000/users
Content-Type: application/json

{
  "id": "8752d3f6-f361-4c1f-b701-ba0761c3003b",
  "email": "user1@example.com",
  "full_name": "Nguyễn Văn A",
  "phone": "0123456789"
}
```

```http
POST http://localhost:3000/users
Content-Type: application/json

{
  "id": "6803be8a-78a3-4c69-9eb5-9a1ae114502e",
  "email": "host1@example.com",
  "full_name": "Trần Thị B",
  "phone": "0987654321"
}
```

```http
POST http://localhost:3000/users
Content-Type: application/json

{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "email": "user2@example.com",
  "full_name": "Lê Văn C",
  "phone": "0111222333"
}
```

### **2. Tạo Rooms (SQL trong Supabase):**
```sql
-- Room 1
INSERT INTO rooms (id, host_id, title, description, address, city, country, latitude, longitude, price_per_night, max_guests, bedroom_count, bathroom_count, amenities, is_available, is_verified) VALUES
('44e8f956-8c55-46e4-9c6c-1348aadda32a', '6803be8a-78a3-4c69-9eb5-9a1ae114502e', 'Phòng đẹp ở Quận 1', 'Phòng view đẹp, gần trung tâm', '123 Nguyễn Huệ, Quận 1', 'TP.HCM', 'Việt Nam', '10.7769', '106.7009', 500000, 2, 1, 1, ARRAY['WiFi', 'Điều hòa', 'Bếp', 'Tủ lạnh'], true, true);

-- Room 2
INSERT INTO rooms (id, host_id, title, description, address, city, country, latitude, longitude, price_per_night, max_guests, bedroom_count, bathroom_count, amenities, is_available, is_verified) VALUES
('b2c3d4e5-f6g7-8901-bcde-f23456789012', '6803be8a-78a3-4c69-9eb5-9a1ae114502e', 'Phòng cao cấp ở Quận 2', 'Phòng view sông, sang trọng', '456 Võ Văn Ngân, Quận 2', 'TP.HCM', 'Việt Nam', '10.7869', '106.7109', 800000, 4, 2, 2, ARRAY['WiFi', 'Điều hòa', 'Bếp', 'Tủ lạnh', 'Máy giặt', 'Hồ bơi'], true, true);
```

---

## 📋 **1. CREATE BOOKING API**

### **1.1. Tạo booking thành công (cơ bản):**
```http
POST http://localhost:3000/bookings
Content-Type: application/json

{
  "room_id": "44e8f956-8c55-46e4-9c6c-1348aadda32a",
  "user_id": "8752d3f6-f361-4c1f-b701-ba0761c3003b",
  "host_id": "6803be8a-78a3-4c69-9eb5-9a1ae114502e",
  "check_in_date": "2024-10-10",
  "check_out_date": "2024-10-15",
  "guest_count": 2,
  "total_amount": 2500000,
  "status": "pending"
}
```

**Expected Response:**
```json
{
  "id": "booking-uuid-here",
  "room_id": "44e8f956-8c55-46e4-9c6c-1348aadda32a",
  "user_id": "8752d3f6-f361-4c1f-b701-ba0761c3003b",
  "host_id": "6803be8a-78a3-4c69-9eb5-9a1ae114502e",
  "check_in_date": "2024-10-10T00:00:00.000Z",
  "check_out_date": "2024-10-15T00:00:00.000Z",
  "guest_count": 2,
  "total_amount": 2500000,
  "status": "pending",
  "guest_notes": null,
  "host_notes": null,
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T10:30:00.000Z"
}
```

### **1.2. Tạo booking với guest_notes:**
```http
POST http://localhost:3000/bookings
Content-Type: application/json

{
  "room_id": "b2c3d4e5-f6g7-8901-bcde-f23456789012",
  "user_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "host_id": "6803be8a-78a3-4c69-9eb5-9a1ae114502e",
  "check_in_date": "2024-10-20",
  "check_out_date": "2024-10-25",
  "guest_count": 3,
  "total_amount": 4000000,
  "status": "pending",
  "guest_notes": "Cần phòng yên tĩnh, view đẹp, có thể check-in sớm không?"
}
```

### **1.3. Test validation errors:**

#### **A. UUID không hợp lệ:**
```http
POST http://localhost:3000/bookings
Content-Type: application/json

{
  "room_id": "invalid-uuid",
  "user_id": "8752d3f6-f361-4c1f-b701-ba0761c3003b",
  "host_id": "6803be8a-78a3-4c69-9eb5-9a1ae114502e",
  "check_in_date": "2024-10-10",
  "check_out_date": "2024-10-15",
  "guest_count": 2,
  "total_amount": 2500000,
  "status": "pending"
}
```

#### **B. Ngày không hợp lệ:**
```http
POST http://localhost:3000/bookings
Content-Type: application/json

{
  "room_id": "44e8f956-8c55-46e4-9c6c-1348aadda32a",
  "user_id": "8752d3f6-f361-4c1f-b701-ba0761c3003b",
  "host_id": "6803be8a-78a3-4c69-9eb5-9a1ae114502e",
  "check_in_date": "2024-10-15",
  "check_out_date": "2024-10-10",
  "guest_count": 2,
  "total_amount": 2500000,
  "status": "pending"
}
```

#### **C. Guest count = 0:**
```http
POST http://localhost:3000/bookings
Content-Type: application/json

{
  "room_id": "44e8f956-8c55-46e4-9c6c-1348aadda32a",
  "user_id": "8752d3f6-f361-4c1f-b701-ba0761c3003b",
  "host_id": "6803be8a-78a3-4c69-9eb5-9a1ae114502e",
  "check_in_date": "2024-10-10",
  "check_out_date": "2024-10-15",
  "guest_count": 0,
  "total_amount": 2500000,
  "status": "pending"
}
```

#### **D. Status không hợp lệ:**
```http
POST http://localhost:3000/bookings
Content-Type: application/json

{
  "room_id": "44e8f956-8c55-46e4-9c6c-1348aadda32a",
  "user_id": "8752d3f6-f361-4c1f-b701-ba0761c3003b",
  "host_id": "6803be8a-78a3-4c69-9eb5-9a1ae114502e",
  "check_in_date": "2024-10-10",
  "check_out_date": "2024-10-15",
  "guest_count": 2,
  "total_amount": 2500000,
  "status": "invalid_status"
}
```

### **1.4. Test booking conflict:**
```http
POST http://localhost:3000/bookings
Content-Type: application/json

{
  "room_id": "44e8f956-8c55-46e4-9c6c-1348aadda32a",
  "user_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "host_id": "6803be8a-78a3-4c69-9eb5-9a1ae114502e",
  "check_in_date": "2024-10-12",
  "check_out_date": "2024-10-17",
  "guest_count": 2,
  "total_amount": 2500000,
  "status": "pending"
}
```

---

## 📋 **2. GET ALL BOOKINGS API**

### **2.1. Lấy tất cả bookings:**
```http
GET http://localhost:3000/bookings
```

**Expected Response:**
```json
[
  {
    "id": "booking-1-uuid",
    "room_id": "44e8f956-8c55-46e4-9c6c-1348aadda32a",
    "user_id": "8752d3f6-f361-4c1f-b701-ba0761c3003b",
    "host_id": "6803be8a-78a3-4c69-9eb5-9a1ae114502e",
    "check_in_date": "2024-10-10T00:00:00.000Z",
    "check_out_date": "2024-10-15T00:00:00.000Z",
    "guest_count": 2,
    "total_amount": 2500000,
    "status": "pending",
    "guest_notes": null,
    "host_notes": null,
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  },
  {
    "id": "booking-2-uuid",
    "room_id": "b2c3d4e5-f6g7-8901-bcde-f23456789012",
    "user_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "host_id": "6803be8a-78a3-4c69-9eb5-9a1ae114502e",
    "check_in_date": "2024-10-20T00:00:00.000Z",
    "check_out_date": "2024-10-25T00:00:00.000Z",
    "guest_count": 3,
    "total_amount": 4000000,
    "status": "pending",
    "guest_notes": "Cần phòng yên tĩnh, view đẹp, có thể check-in sớm không?",
    "host_notes": null,
    "created_at": "2024-01-15T10:35:00.000Z",
    "updated_at": "2024-01-15T10:35:00.000Z"
  }
]
```

---

## 📋 **3. GET BOOKING BY ID API**

### **3.1. Lấy booking theo ID (thành công):**
```http
GET http://localhost:3000/bookings/booking-1-uuid
```

**Expected Response:**
```json
{
  "id": "booking-1-uuid",
  "room_id": "44e8f956-8c55-46e4-9c6c-1348aadda32a",
  "user_id": "8752d3f6-f361-4c1f-b701-ba0761c3003b",
  "host_id": "6803be8a-78a3-4c69-9eb5-9a1ae114502e",
  "check_in_date": "2024-10-10T00:00:00.000Z",
  "check_out_date": "2024-10-15T00:00:00.000Z",
  "guest_count": 2,
  "total_amount": 2500000,
  "status": "pending",
  "guest_notes": null,
  "host_notes": null,
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T10:30:00.000Z"
}
```

### **3.2. Lấy booking không tồn tại:**
```http
GET http://localhost:3000/bookings/non-existent-uuid
```

**Expected Response:**
```json
{
  "statusCode": 404,
  "message": "Booking not found"
}
```

---

## 📋 **4. UPDATE BOOKING API**

### **4.1. Cập nhật status booking:**
```http
PATCH http://localhost:3000/bookings/booking-1-uuid
Content-Type: application/json

{
  "status": "confirmed",
  "host_notes": "Đã xác nhận, phòng sẵn sàng. Check-in từ 14:00"
}
```

**Expected Response:**
```json
{
  "id": "booking-1-uuid",
  "room_id": "44e8f956-8c55-46e4-9c6c-1348aadda32a",
  "user_id": "8752d3f6-f361-4c1f-b701-ba0761c3003b",
  "host_id": "6803be8a-78a3-4c69-9eb5-9a1ae114502e",
  "check_in_date": "2024-10-10T00:00:00.000Z",
  "check_out_date": "2024-10-15T00:00:00.000Z",
  "guest_count": 2,
  "total_amount": 2500000,
  "status": "confirmed",
  "guest_notes": null,
  "host_notes": "Đã xác nhận, phòng sẵn sàng. Check-in từ 14:00",
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T11:00:00.000Z"
}
```

### **4.2. Cập nhật guest_notes:**
```http
PATCH http://localhost:3000/bookings/booking-2-uuid
Content-Type: application/json

{
  "guest_notes": "Cần thêm gối và chăn ấm"
}
```

### **4.3. Cập nhật status thành cancelled:**
```http
PATCH http://localhost:3000/bookings/booking-1-uuid
Content-Type: application/json

{
  "status": "cancelled",
  "host_notes": "Khách hủy booking"
}
```

### **4.4. Test validation errors:**

#### **A. Status không hợp lệ:**
```http
PATCH http://localhost:3000/bookings/booking-1-uuid
Content-Type: application/json

{
  "status": "invalid_status"
}
```

#### **B. Guest count âm:**
```http
PATCH http://localhost:3000/bookings/booking-1-uuid
Content-Type: application/json

{
  "guest_count": -1
}
```

---

## 📋 **5. DELETE BOOKING API**

### **5.1. Xóa booking thành công:**
```http
DELETE http://localhost:3000/bookings/booking-1-uuid
```

**Expected Response:**
```json
{
  "message": "Booking deleted successfully"
}
```

### **5.2. Xóa booking không tồn tại:**
```http
DELETE http://localhost:3000/bookings/non-existent-uuid
```

**Expected Response:**
```json
{
  "statusCode": 404,
  "message": "Booking not found"
}
```

---

## 📋 **6. GET USER BOOKINGS API**

### **6.1. Lấy bookings của user:**
```http
GET http://localhost:3000/bookings/user/8752d3f6-f361-4c1f-b701-ba0761c3003b
```

**Expected Response:**
```json
[
  {
    "id": "booking-1-uuid",
    "room_id": "44e8f956-8c55-46e4-9c6c-1348aadda32a",
    "user_id": "8752d3f6-f361-4c1f-b701-ba0761c3003b",
    "host_id": "6803be8a-78a3-4c69-9eb5-9a1ae114502e",
    "check_in_date": "2024-10-10T00:00:00.000Z",
    "check_out_date": "2024-10-15T00:00:00.000Z",
    "guest_count": 2,
    "total_amount": 2500000,
    "status": "confirmed",
    "guest_notes": null,
    "host_notes": "Đã xác nhận, phòng sẵn sàng. Check-in từ 14:00",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T11:00:00.000Z"
  }
]
```

---

## 📋 **7. GET HOST BOOKINGS API**

### **7.1. Lấy tất cả bookings của host:**
```http
GET http://localhost:3000/bookings/host/6803be8a-78a3-4c69-9eb5-9a1ae114502e
```

**Expected Response:**
```json
[
  {
    "id": "booking-1-uuid",
    "room_id": "44e8f956-8c55-46e4-9c6c-1348aadda32a",
    "user_id": "8752d3f6-f361-4c1f-b701-ba0761c3003b",
    "check_in_date": "2024-10-10T00:00:00.000Z",
    "check_out_date": "2024-10-15T00:00:00.000Z",
    "guest_count": 2,
    "total_amount": 2500000,
    "status": "confirmed",
    "guest_notes": null,
    "host_notes": "Đã xác nhận, phòng sẵn sàng. Check-in từ 14:00",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T11:00:00.000Z",
    "rooms": {
      "id": "44e8f956-8c55-46e4-9c6c-1348aadda32a",
      "title": "Phòng đẹp ở Quận 1",
      "address": "123 Nguyễn Huệ, Quận 1",
      "city": "TP.HCM",
      "country": "Việt Nam"
    },
    "users": {
      "id": "8752d3f6-f361-4c1f-b701-ba0761c3003b",
      "full_name": "Nguyễn Văn A",
      "email": "user1@example.com",
      "phone": "0123456789"
    }
  },
  {
    "id": "booking-2-uuid",
    "room_id": "b2c3d4e5-f6g7-8901-bcde-f23456789012",
    "user_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "check_in_date": "2024-10-20T00:00:00.000Z",
    "check_out_date": "2024-10-25T00:00:00.000Z",
    "guest_count": 3,
    "total_amount": 4000000,
    "status": "pending",
    "guest_notes": "Cần phòng yên tĩnh, view đẹp, có thể check-in sớm không?",
    "host_notes": null,
    "created_at": "2024-01-15T10:35:00.000Z",
    "updated_at": "2024-01-15T10:35:00.000Z",
    "rooms": {
      "id": "b2c3d4e5-f6g7-8901-bcde-f23456789012",
      "title": "Phòng cao cấp ở Quận 2",
      "address": "456 Võ Văn Ngân, Quận 2",
      "city": "TP.HCM",
      "country": "Việt Nam"
    },
    "users": {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "full_name": "Lê Văn C",
      "email": "user2@example.com",
      "phone": "0111222333"
    }
  }
]
```

---

## 📋 **8. GET ROOM BOOKINGS API**

### **8.1. Lấy bookings của một phòng cụ thể:**
```http
GET http://localhost:3000/bookings/host/6803be8a-78a3-4c69-9eb5-9a1ae114502e/room/44e8f956-8c55-46e4-9c6c-1348aadda32a
```

**Expected Response:**
```json
[
  {
    "id": "booking-1-uuid",
    "room_id": "44e8f956-8c55-46e4-9c6c-1348aadda32a",
    "user_id": "8752d3f6-f361-4c1f-b701-ba0761c3003b",
    "check_in_date": "2024-10-10T00:00:00.000Z",
    "check_out_date": "2024-10-15T00:00:00.000Z",
    "guest_count": 2,
    "total_amount": 2500000,
    "status": "confirmed",
    "guest_notes": null,
    "host_notes": "Đã xác nhận, phòng sẵn sàng. Check-in từ 14:00",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T11:00:00.000Z",
    "rooms": {
      "id": "44e8f956-8c55-46e4-9c6c-1348aadda32a",
      "title": "Phòng đẹp ở Quận 1",
      "address": "123 Nguyễn Huệ, Quận 1",
      "city": "TP.HCM",
      "country": "Việt Nam"
    },
    "users": {
      "id": "8752d3f6-f361-4c1f-b701-ba0761c3003b",
      "full_name": "Nguyễn Văn A",
      "email": "user1@example.com",
      "phone": "0123456789"
    }
  }
]
```

---

## 📋 **9. GET HOST BOOKINGS BY DATE RANGE API**

### **9.1. Lấy bookings theo khoảng thời gian:**
```http
GET http://localhost:3000/bookings/host/6803be8a-78a3-4c69-9eb5-9a1ae114502e/date-range?startDate=2024-10-01&endDate=2024-10-31
```

**Expected Response:**
```json
[
  {
    "id": "booking-1-uuid",
    "room_id": "44e8f956-8c55-46e4-9c6c-1348aadda32a",
    "user_id": "8752d3f6-f361-4c1f-b701-ba0761c3003b",
    "check_in_date": "2024-10-10T00:00:00.000Z",
    "check_out_date": "2024-10-15T00:00:00.000Z",
    "guest_count": 2,
    "total_amount": 2500000,
    "status": "confirmed",
    "guest_notes": null,
    "host_notes": "Đã xác nhận, phòng sẵn sàng. Check-in từ 14:00",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T11:00:00.000Z",
    "rooms": {
      "id": "44e8f956-8c55-46e4-9c6c-1348aadda32a",
      "title": "Phòng đẹp ở Quận 1",
      "address": "123 Nguyễn Huệ, Quận 1",
      "city": "TP.HCM",
      "country": "Việt Nam"
    },
    "users": {
      "id": "8752d3f6-f361-4c1f-b701-ba0761c3003b",
      "full_name": "Nguyễn Văn A",
      "email": "user1@example.com",
      "phone": "0123456789"
    }
  },
  {
    "id": "booking-2-uuid",
    "room_id": "b2c3d4e5-f6g7-8901-bcde-f23456789012",
    "user_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "check_in_date": "2024-10-20T00:00:00.000Z",
    "check_out_date": "2024-10-25T00:00:00.000Z",
    "guest_count": 3,
    "total_amount": 4000000,
    "status": "pending",
    "guest_notes": "Cần phòng yên tĩnh, view đẹp, có thể check-in sớm không?",
    "host_notes": null,
    "created_at": "2024-01-15T10:35:00.000Z",
    "updated_at": "2024-01-15T10:35:00.000Z",
    "rooms": {
      "id": "b2c3d4e5-f6g7-8901-bcde-f23456789012",
      "title": "Phòng cao cấp ở Quận 2",
      "address": "456 Võ Văn Ngân, Quận 2",
      "city": "TP.HCM",
      "country": "Việt Nam"
    },
    "users": {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "full_name": "Lê Văn C",
      "email": "user2@example.com",
      "phone": "0111222333"
    }
  }
]
```

### **9.2. Test validation errors:**

#### **A. Thiếu startDate:**
```http
GET http://localhost:3000/bookings/host/6803be8a-78a3-4c69-9eb5-9a1ae114502e/date-range?endDate=2024-10-31
```

#### **B. Thiếu endDate:**
```http
GET http://localhost:3000/bookings/host/6803be8a-78a3-4c69-9eb5-9a1ae114502e/date-range?startDate=2024-10-01
```

---

## 📋 **10. GET HOST BOOKING STATS API**

### **10.1. Lấy thống kê booking của host:**
```http
GET http://localhost:3000/bookings/host/6803be8a-78a3-4c69-9eb5-9a1ae114502e/stats
```

**Expected Response:**
```json
{
  "total_bookings": 2,
  "status_counts": {
    "pending": 1,
    "confirmed": 1,
    "in_progress": 0,
    "completed": 0,
    "cancelled": 0,
    "no_show": 0,
    "refunded": 0,
    "disputed": 0
  },
  "total_revenue": 2500000,
  "completed_bookings": 0,
  "pending_bookings": 1,
  "cancelled_bookings": 0
}
```

---

## 📋 **11. ROOM AVAILABILITY APIs**

### **11.1. Kiểm tra availability của phòng:**
```http
GET http://localhost:3000/bookings/room/44e8f956-8c55-46e4-9c6c-1348aadda32a/check-availability?checkInDate=2024-10-16&checkOutDate=2024-10-20
```

**Expected Response:**
```json
{
  "room_id": "44e8f956-8c55-46e4-9c6c-1348aadda32a",
  "check_in_date": "2024-10-16",
  "check_out_date": "2024-10-20",
  "is_available": true
}
```

### **11.2. Kiểm tra availability trùng lịch:**
```http
GET http://localhost:3000/bookings/room/44e8f956-8c55-46e4-9c6c-1348aadda32a/check-availability?checkInDate=2024-10-12&checkOutDate=2024-10-17
```

**Expected Response:**
```json
{
  "room_id": "44e8f956-8c55-46e4-9c6c-1348aadda32a",
  "check_in_date": "2024-10-12",
  "check_out_date": "2024-10-17",
  "is_available": false
}
```

### **11.3. Lấy lịch availability của phòng:**
```http
GET http://localhost:3000/bookings/host/6803be8a-78a3-4c69-9eb5-9a1ae114502e/room/44e8f956-8c55-46e4-9c6c-1348aadda32a/availability?startDate=2024-10-01&endDate=2024-10-31
```

**Expected Response:**
```json
{
  "room_id": "44e8f956-8c55-46e4-9c6c-1348aadda32a",
  "room_title": "Phòng đẹp ở Quận 1",
  "start_date": "2024-10-01",
  "end_date": "2024-10-31",
  "availability": [
    {
      "date": "2024-10-01",
      "is_available": true,
      "bookings": []
    },
    {
      "date": "2024-10-10",
      "is_available": false,
      "bookings": [
        {
          "id": "booking-1-uuid",
          "status": "confirmed",
          "guest_count": 2,
          "user": {
            "id": "8752d3f6-f361-4c1f-b701-ba0761c3003b",
            "full_name": "Nguyễn Văn A",
            "email": "user1@example.com"
          }
        }
      ]
    }
  ],
  "summary": {
    "total_days": 31,
    "available_days": 30,
    "booked_days": 1,
    "occupancy_rate": 3
  }
}
```

### **11.4. Lấy availability của tất cả phòng:**
```http
GET http://localhost:3000/bookings/host/6803be8a-78a3-4c69-9eb5-9a1ae114502e/availability?startDate=2024-10-01&endDate=2024-10-31
```

**Expected Response:**
```json
{
  "host_id": "6803be8a-78a3-4c69-9eb5-9a1ae114502e",
  "start_date": "2024-10-01",
  "end_date": "2024-10-31",
  "rooms": [
    {
      "room_id": "44e8f956-8c55-46e4-9c6c-1348aadda32a",
      "room_title": "Phòng đẹp ở Quận 1",
      "start_date": "2024-10-01",
      "end_date": "2024-10-31",
      "availability": [...],
      "summary": {
        "total_days": 31,
        "available_days": 30,
        "booked_days": 1,
        "occupancy_rate": 3
      }
    },
    {
      "room_id": "b2c3d4e5-f6g7-8901-bcde-f23456789012",
      "room_title": "Phòng cao cấp ở Quận 2",
      "start_date": "2024-10-01",
      "end_date": "2024-10-31",
      "availability": [...],
      "summary": {
        "total_days": 31,
        "available_days": 29,
        "booked_days": 2,
        "occupancy_rate": 6
      }
    }
  ]
}
```

---

## 📋 **12. CANCEL BOOKING API**

### **12.1. Hủy booking thành công:**
```http
POST http://localhost:3000/bookings/booking-1-uuid/cancel
```

**Expected Response:**
```json
{
  "id": "booking-1-uuid",
  "room_id": "44e8f956-8c55-46e4-9c6c-1348aadda32a",
  "user_id": "8752d3f6-f361-4c1f-b701-ba0761c3003b",
  "host_id": "6803be8a-78a3-4c69-9eb5-9a1ae114502e",
  "check_in_date": "2024-10-10T00:00:00.000Z",
  "check_out_date": "2024-10-15T00:00:00.000Z",
  "guest_count": 2,
  "total_amount": 2500000,
  "status": "cancelled",
  "guest_notes": null,
  "host_notes": "Đã xác nhận, phòng sẵn sàng. Check-in từ 14:00",
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T12:00:00.000Z"
}
```

### **12.2. Hủy booking không tồn tại:**
```http
POST http://localhost:3000/bookings/non-existent-uuid/cancel
```

**Expected Response:**
```json
{
  "statusCode": 404,
  "message": "Booking not found"
}
```

---

## 🧪 **Test Flow tổng thể:**

### **Phase 1: Setup**
1. Tạo users (3 users)
2. Tạo rooms (2 rooms)

### **Phase 2: Basic CRUD**
3. Tạo booking 1
4. Tạo booking 2
5. Lấy tất cả bookings
6. Lấy booking theo ID
7. Cập nhật booking
8. Xóa booking

### **Phase 3: Advanced Features**
9. Test booking conflict
10. Test validation errors
11. Test host bookings
12. Test user bookings
13. Test date range queries
14. Test availability APIs
15. Test stats API

### **Phase 4: Edge Cases**
16. Test với UUID không hợp lệ
17. Test với ngày không hợp lệ
18. Test với status không hợp lệ
19. Test với guest count không hợp lệ
20. Test với room/user không tồn tại

---

## 📊 **Expected Test Results:**

- ✅ **200+ responses:** 15 cases
- ✅ **400 validation errors:** 8 cases  
- ✅ **404 not found errors:** 3 cases
- ✅ **409 conflict errors:** 1 case
- ✅ **Total test cases:** 27 cases

Bây giờ bạn có thể copy-paste từng test case và chạy! 🚀
