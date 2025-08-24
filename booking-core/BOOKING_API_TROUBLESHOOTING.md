# Booking API Troubleshooting

## 🚨 **Lỗi thường gặp và cách khắc phục:**

### **1. Lỗi UUID không hợp lệ:**

**Lỗi:**
```json
{
    "statusCode": 400,
    "message": "Failed to create booking: invalid input syntax for type uuid: \"temp-user-id\""
}
```

**Nguyên nhân:** Sử dụng string thường thay vì UUID hợp lệ.

**Cách khắc phục:**

#### **A. Sử dụng UUID có sẵn từ database:**
```json
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

#### **B. Tạo UUID mới:**
```json
{
  "room_id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "550e8400-e29b-41d4-a716-446655440001",
  "host_id": "550e8400-e29b-41d4-a716-446655440002",
  "check_in_date": "2024-10-10",
  "check_out_date": "2024-10-15",
  "guest_count": 2,
  "total_amount": 2500000,
  "status": "pending"
}
```

#### **C. Lấy UUID thực tế từ database:**
```sql
-- Lấy danh sách users
SELECT id, email, full_name FROM users;

-- Lấy danh sách rooms
SELECT id, title, host_id FROM rooms;
```

### **2. Lỗi Foreign Key Constraint:**

**Lỗi:**
```json
{
    "statusCode": 400,
    "message": "Failed to create booking: insert or update on table \"bookings\" violates foreign key constraint \"bookings_room_id_fkey\""
}
```

**Nguyên nhân:** `room_id`, `user_id`, hoặc `host_id` không tồn tại trong database.

**Cách khắc phục:**

#### **A. Tạo users trước:**
```http
POST /users
{
  "id": "8752d3f6-f361-4c1f-b701-ba0761c3003b",
  "email": "user@example.com",
  "full_name": "Nguyễn Văn A",
  "phone": "0123456789"
}
```

```http
POST /users
{
  "id": "6803be8a-78a3-4c69-9eb5-9a1ae114502e",
  "email": "host@example.com",
  "full_name": "Trần Thị B",
  "phone": "0987654321"
}
```

#### **B. Tạo room trước:**
```sql
INSERT INTO rooms (id, host_id, title, description, address, city, country, latitude, longitude, price_per_night, max_guests, bedroom_count, bathroom_count, amenities, is_available, is_verified) VALUES
('44e8f956-8c55-46e4-9c6c-1348aadda32a', '6803be8a-78a3-4c69-9eb5-9a1ae114502e', 'Phòng đẹp ở Quận 1', 'Phòng view đẹp, gần trung tâm', '123 Nguyễn Huệ, Quận 1', 'TP.HCM', 'Việt Nam', '10.7769', '106.7009', 500000, 2, 1, 1, ARRAY['WiFi', 'Điều hòa', 'Bếp', 'Tủ lạnh'], true, true);
```

### **3. Lỗi Booking Conflict:**

**Lỗi:**
```json
{
    "statusCode": 400,
    "message": "Failed to create booking: Room is not available for the selected dates. There are 1 conflicting bookings."
}
```

**Nguyên nhân:** Phòng đã được book trong khoảng thời gian này.

**Cách khắc phục:**

#### **A. Kiểm tra availability trước:**
```http
GET /bookings/room/44e8f956-8c55-46e4-9c6c-1348aadda32a/check-availability?checkInDate=2024-10-10&checkOutDate=2024-10-15
```

#### **B. Sử dụng ngày khác:**
```json
{
  "room_id": "44e8f956-8c55-46e4-9c6c-1348aadda32a",
  "user_id": "8752d3f6-f361-4c1f-b701-ba0761c3003b",
  "host_id": "6803be8a-78a3-4c69-9eb5-9a1ae114502e",
  "check_in_date": "2024-10-16",  // Ngày khác
  "check_out_date": "2024-10-20",  // Ngày khác
  "guest_count": 2,
  "total_amount": 2500000,
  "status": "pending"
}
```

### **4. Lỗi Validation:**

**Lỗi:**
```json
{
    "statusCode": 400,
    "message": "Failed to create booking: check_in_date must be a valid date"
}
```

**Nguyên nhân:** Format ngày không đúng.

**Cách khắc phục:**

#### **A. Sử dụng format YYYY-MM-DD:**
```json
{
  "check_in_date": "2024-10-10",   // ✅ Đúng
  "check_out_date": "2024-10-15"   // ✅ Đúng
}
```

#### **B. Không sử dụng:**
```json
{
  "check_in_date": "10/10/2024",   // ❌ Sai
  "check_out_date": "15-10-2024"   // ❌ Sai
}
```

### **5. Lỗi Status không hợp lệ:**

**Lỗi:**
```json
{
    "statusCode": 400,
    "message": "Failed to create booking: invalid input value for enum booking_status"
}
```

**Nguyên nhân:** Status không nằm trong danh sách cho phép.

**Cách khắc phục:**

#### **A. Sử dụng status hợp lệ:**
```json
{
  "status": "pending"      // ✅ Hợp lệ
  // "status": "confirmed"   // ✅ Hợp lệ
  // "status": "cancelled"   // ✅ Hợp lệ
}
```

#### **B. Không sử dụng:**
```json
{
  "status": "active"       // ❌ Không hợp lệ
  // "status": "booked"      // ❌ Không hợp lệ
}
```

## 🚀 **Test Flow đúng:**

### **Bước 1: Tạo Users**
```http
POST /users
{
  "id": "8752d3f6-f361-4c1f-b701-ba0761c3003b",
  "email": "user@example.com",
  "full_name": "Nguyễn Văn A",
  "phone": "0123456789"
}
```

### **Bước 2: Tạo Room (nếu chưa có)**
```sql
INSERT INTO rooms (id, host_id, title, description, address, city, country, latitude, longitude, price_per_night, max_guests, bedroom_count, bathroom_count, amenities, is_available, is_verified) VALUES
('44e8f956-8c55-46e4-9c6c-1348aadda32a', '6803be8a-78a3-4c69-9eb5-9a1ae114502e', 'Phòng đẹp ở Quận 1', 'Phòng view đẹp, gần trung tâm', '123 Nguyễn Huệ, Quận 1', 'TP.HCM', 'Việt Nam', '10.7769', '106.7009', 500000, 2, 1, 1, ARRAY['WiFi', 'Điều hòa', 'Bếp', 'Tủ lạnh'], true, true);
```

### **Bước 3: Kiểm tra Availability**
```http
GET /bookings/room/44e8f956-8c55-46e4-9c6c-1348aadda32a/check-availability?checkInDate=2024-10-10&checkOutDate=2024-10-15
```

### **Bước 4: Tạo Booking**
```http
POST /bookings
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

## 🛠️ **Tools để tạo UUID:**

### **Online UUID Generator:**
- https://www.uuidgenerator.net/
- https://uuidgenerator.net/

### **Command Line:**
```bash
# macOS/Linux
uuidgen

# Hoặc sử dụng Node.js
node -e "console.log(require('crypto').randomUUID())"
```

### **Postman:**
```javascript
// Trong Pre-request Script
pm.environment.set("userId", pm.variables.replaceIn("{{$guid}}"));
pm.environment.set("hostId", pm.variables.replaceIn("{{$guid}}"));
pm.environment.set("roomId", pm.variables.replaceIn("{{$guid}}"));
```

## 📋 **Checklist trước khi test:**

- [ ] Users đã được tạo với UUID hợp lệ
- [ ] Room đã được tạo với UUID hợp lệ
- [ ] Host ID trong room khớp với user ID
- [ ] Ngày tháng đúng format YYYY-MM-DD
- [ ] Status nằm trong danh sách cho phép
- [ ] Guest count > 0
- [ ] Total amount >= 0
