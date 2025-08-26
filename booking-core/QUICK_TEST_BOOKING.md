# Quick Test Booking API

## 🚀 **Copy-paste ngay để test:**

### **1. Tạo User 1:**
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

### **2. Tạo User 2 (Host):**
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

### **3. Tạo Room (chạy SQL trong Supabase):**
```sql
INSERT INTO rooms (id, host_id, title, description, address, city, country, latitude, longitude, price_per_night, max_guests, bedroom_count, bathroom_count, amenities, is_available, is_verified) VALUES
('44e8f956-8c55-46e4-9c6c-1348aadda32a', '6803be8a-78a3-4c69-9eb5-9a1ae114502e', 'Phòng đẹp ở Quận 1', 'Phòng view đẹp, gần trung tâm', '123 Nguyễn Huệ, Quận 1', 'TP.HCM', 'Việt Nam', '10.7769', '106.7009', 500000, 2, 1, 1, ARRAY['WiFi', 'Điều hòa', 'Bếp', 'Tủ lạnh'], true, true);
```

### **4. Tạo Booking:**
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

## 🧪 **Test từng bước:**

### **Bước 1: Test tạo user**
- Copy request 1 và 2
- Paste vào Postman
- Chạy và kiểm tra response 201

### **Bước 2: Tạo room**
- Vào Supabase Dashboard → SQL Editor
- Copy SQL ở bước 3
- Chạy và kiểm tra "INSERT 0 1"

### **Bước 3: Test tạo booking**
- Copy request 4
- Paste vào Postman
- Chạy và kiểm tra response 201

## ✅ **Response mong đợi:**

### **User Response:**
```json
{
  "id": "8752d3f6-f361-4c1f-b701-ba0761c3003b",
  "email": "user@example.com",
  "full_name": "Nguyễn Văn A",
  "phone": "0123456789",
  "avatar_url": null,
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T10:30:00.000Z"
}
```

### **Booking Response:**
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

## 🚨 **Nếu vẫn lỗi:**

### **Kiểm tra:**
1. Server đã chạy chưa? (`npm run start:dev`)
2. Database đã setup chưa? (chạy SQL schema)
3. UUID có đúng format không? (8-4-4-4-12 characters)

### **Debug:**
```bash
# Kiểm tra server
curl http://localhost:3000

# Kiểm tra database connection
# Vào Supabase Dashboard → Table Editor → xem có bảng users, rooms, bookings không
```

## 🎯 **UUID Format đúng:**
```
xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
8752d3f6-f361-4c1f-b701-ba0761c3003b  ✅
6803be8a-78a3-4c69-9eb5-9a1ae114502e  ✅
44e8f956-8c55-46e4-9c6c-1348aadda32a  ✅
```
