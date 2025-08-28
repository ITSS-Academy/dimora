# Debug Test với Logging

## 🚀 **Chạy server với logging:**

```bash
npm run start:dev
```

## 🧪 **Test từng bước:**

### **Bước 1: Test tạo User (nếu chưa có)**
```http
POST http://localhost:3000/users
Content-Type: application/json

{
  "id": "8752d3f6-f361-4c1f-b701-ba0761c3003b",
  "email": "user@example.com",
  "full_name": "Nguyễn Văn A",
  "phone": "0123456789"
}
```

### **Bước 2: Test tạo User Host (nếu chưa có)**
```http
POST http://localhost:3000/users
Content-Type: application/json

{
  "id": "6803be8a-78a3-4c69-9eb5-9a1ae114502e",
  "email": "host@example.com",
  "full_name": "Trần Thị B",
  "phone": "0987654321"
}
```

### **Bước 3: Tạo Room (SQL trong Supabase)**
```sql
INSERT INTO rooms (id, host_id, title, description, address, city, country, latitude, longitude, price_per_night, max_guests, bedroom_count, bathroom_count, amenities, is_available, is_verified) VALUES
('44e8f956-8c55-46e4-9c6c-1348aadda32a', '6803be8a-78a3-4c69-9eb5-9a1ae114502e', 'Phòng đẹp ở Quận 1', 'Phòng view đẹp, gần trung tâm', '123 Nguyễn Huệ, Quận 1', 'TP.HCM', 'Việt Nam', '10.7769', '106.7009', 500000, 2, 1, 1, ARRAY['WiFi', 'Điều hòa', 'Bếp', 'Tủ lạnh'], true, true);
```

### **Bước 4: Test tạo Booking (với logging)**
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

## 📋 **Logs mong đợi:**

### **Controller Logs:**
```
🎯 [BOOKING CONTROLLER] POST /bookings called
📝 [BOOKING CONTROLLER] Request body: { ... }
✅ [BOOKING CONTROLLER] DTO validation passed
👤 [BOOKING CONTROLLER] Using user ID: 8752d3f6-f361-4c1f-b701-ba0761c3003b
```

### **Service Logs:**
```
🔍 [BOOKING SERVICE] Starting create booking...
📝 [BOOKING SERVICE] Input DTO: { ... }
👤 [BOOKING SERVICE] User ID from parameter: 8752d3f6-f361-4c1f-b701-ba0761c3003b
🔍 [BOOKING SERVICE] Fetching room information...
✅ [BOOKING SERVICE] Room found: { host_id: "...", price_per_night: 500000, max_guests: 2 }
🔍 [BOOKING SERVICE] Checking guest count...
✅ [BOOKING SERVICE] Guest count OK: 2
🔍 [BOOKING SERVICE] Calculating dates and amount...
📅 [BOOKING SERVICE] Date calculation: { check_in: "...", check_out: "...", days_diff: 5 }
💰 [BOOKING SERVICE] Total amount calculated: 2500000
📝 [BOOKING SERVICE] Final booking data: { ... }
🚀 [BOOKING SERVICE] Inserting booking into database...
✅ [BOOKING SERVICE] Booking created successfully: booking-uuid-here
```

## 🚨 **Nếu có lỗi, logs sẽ hiển thị:**

### **Validation Error:**
```
❌ [BOOKING CONTROLLER] DTO validation failed
```

### **Room Not Found:**
```
❌ [BOOKING SERVICE] Room error: invalid input syntax for type uuid
❌ [BOOKING SERVICE] Room ID requested: temp-room-id
```

### **Database Error:**
```
❌ [BOOKING SERVICE] Database error: invalid input syntax for type uuid
❌ [BOOKING SERVICE] Error details: { ... }
```

## 🔍 **Kiểm tra từng bước:**

### **1. Kiểm tra server:**
```bash
curl http://localhost:3000
# Should return: {"message":"Hello World!"}
```

### **2. Kiểm tra database connection:**
```bash
# Vào Supabase Dashboard → SQL Editor
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM rooms;
SELECT COUNT(*) FROM bookings;
```

### **3. Kiểm tra UUID format:**
```bash
# UUID phải có format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
echo "44e8f956-8c55-46e4-9c6c-1348aadda32a" | grep -E "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"
```

## 🎯 **Kết quả mong đợi:**

### **Success Response:**
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
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T10:30:00.000Z"
}
```

Bây giờ chạy test và xem logs để biết chính xác lỗi ở đâu! 🔍
