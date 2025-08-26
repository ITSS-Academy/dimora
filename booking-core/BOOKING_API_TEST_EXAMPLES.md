# Booking API Test Examples

## 🧪 Test API Booking

### 1. **Tạo Booking mới**

```http
POST /bookings
Content-Type: application/json
```

**Body:**
```json
{
  "room_id": "44e8f956-8c55-46e4-9c6c-1348aadda32a",
  "check_in_date": "2024-10-10",
  "check_out_date": "2024-10-15",
  "guest_count": 2,
  "guest_notes": "Cần phòng yên tĩnh, view đẹp",
  "user_id": "8752d3f6-f361-4c1f-b701-ba0761c3003b",
  "host_id": "6803be8a-78a3-4c69-9eb5-9a1ae114502e",
  "total_amount": 2500000,
  "status": "pending"
}
```

**Response thành công:**
```json
{
  "id": "booking-abc123",
  "room_id": "44e8f956-8c55-46e4-9c6c-1348aadda32a",
  "user_id": "8752d3f6-f361-4c1f-b701-ba0761c3003b",
  "host_id": "6803be8a-78a3-4c69-9eb5-9a1ae114502e",
  "check_in_date": "2024-10-10T00:00:00.000Z",
  "check_out_date": "2024-10-15T00:00:00.000Z",
  "guest_count": 2,
  "total_amount": 2500000,
  "status": "pending",
  "guest_notes": "Cần phòng yên tĩnh, view đẹp",
  "host_notes": null,
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T10:30:00.000Z"
}
```

### 2. **Cập nhật trạng thái Booking**

```http
PATCH /bookings/booking-abc123
Content-Type: application/json
```

**Body:**
```json
{
  "status": "confirmed",
  "host_notes": "Đã xác nhận, phòng sẵn sàng"
}
```

**Response:**
```json
{
  "id": "booking-abc123",
  "room_id": "44e8f956-8c55-46e4-9c6c-1348aadda32a",
  "user_id": "8752d3f6-f361-4c1f-b701-ba0761c3003b",
  "host_id": "6803be8a-78a3-4c69-9eb5-9a1ae114502e",
  "check_in_date": "2024-10-10T00:00:00.000Z",
  "check_out_date": "2024-10-15T00:00:00.000Z",
  "guest_count": 2,
  "total_amount": 2500000,
  "status": "confirmed",
  "guest_notes": "Cần phòng yên tĩnh, view đẹp",
  "host_notes": "Đã xác nhận, phòng sẵn sàng",
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T11:00:00.000Z"
}
```

### 3. **Lấy tất cả Booking của Host**

```http
GET /bookings/host/6803be8a-78a3-4c69-9eb5-9a1ae114502e
```

**Response:**
```json
[
  {
    "id": "booking-abc123",
    "room_id": "44e8f956-8c55-46e4-9c6c-1348aadda32a",
    "user_id": "8752d3f6-f361-4c1f-b701-ba0761c3003b",
    "check_in_date": "2024-10-10T00:00:00.000Z",
    "check_out_date": "2024-10-15T00:00:00.000Z",
    "guest_count": 2,
    "total_amount": 2500000,
    "status": "confirmed",
    "guest_notes": "Cần phòng yên tĩnh, view đẹp",
    "host_notes": "Đã xác nhận, phòng sẵn sàng",
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
      "email": "user@example.com",
      "phone": "0123456789"
    }
  }
]
```

### 4. **Lấy Booking của một phòng cụ thể**

```http
GET /bookings/host/6803be8a-78a3-4c69-9eb5-9a1ae114502e/room/44e8f956-8c55-46e4-9c6c-1348aadda32a
```

**Response:**
```json
[
  {
    "id": "booking-abc123",
    "room_id": "44e8f956-8c55-46e4-9c6c-1348aadda32a",
    "user_id": "8752d3f6-f361-4c1f-b701-ba0761c3003b",
    "check_in_date": "2024-10-10T00:00:00.000Z",
    "check_out_date": "2024-10-15T00:00:00.000Z",
    "guest_count": 2,
    "total_amount": 2500000,
    "status": "confirmed",
    "guest_notes": "Cần phòng yên tĩnh, view đẹp",
    "host_notes": "Đã xác nhận, phòng sẵn sàng",
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
      "email": "user@example.com",
      "phone": "0123456789"
    }
  }
]
```

### 5. **Lấy Booking theo khoảng thời gian**

```http
GET /bookings/host/6803be8a-78a3-4c69-9eb5-9a1ae114502e/date-range?startDate=2024-10-01&endDate=2024-10-31
```

**Response:**
```json
[
  {
    "id": "booking-abc123",
    "room_id": "44e8f956-8c55-46e4-9c6c-1348aadda32a",
    "user_id": "8752d3f6-f361-4c1f-b701-ba0761c3003b",
    "check_in_date": "2024-10-10T00:00:00.000Z",
    "check_out_date": "2024-10-15T00:00:00.000Z",
    "guest_count": 2,
    "total_amount": 2500000,
    "status": "confirmed",
    "guest_notes": "Cần phòng yên tĩnh, view đẹp",
    "host_notes": "Đã xác nhận, phòng sẵn sàng",
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
      "email": "user@example.com",
      "phone": "0123456789"
    }
  }
]
```

### 6. **Lấy thống kê Booking của Host**

```http
GET /bookings/host/6803be8a-78a3-4c69-9eb5-9a1ae114502e/stats
```

**Response:**
```json
{
  "total_bookings": 25,
  "status_counts": {
    "pending": 5,
    "confirmed": 15,
    "in_progress": 2,
    "completed": 2,
    "cancelled": 1
  },
  "total_revenue": 25000000,
  "completed_bookings": 2,
  "pending_bookings": 5,
  "cancelled_bookings": 1
}
```

### 7. **Lấy lịch Availability của phòng**

```http
GET /bookings/host/6803be8a-78a3-4c69-9eb5-9a1ae114502e/room/44e8f956-8c55-46e4-9c6c-1348aadda32a/availability?startDate=2024-10-01&endDate=2024-10-31
```

**Response:**
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
      "date": "2024-10-02",
      "is_available": true,
      "bookings": []
    },
    {
      "date": "2024-10-10",
      "is_available": false,
      "bookings": [
        {
          "id": "booking-abc123",
          "status": "confirmed",
          "guest_count": 2,
          "user": {
            "id": "8752d3f6-f361-4c1f-b701-ba0761c3003b",
            "full_name": "Nguyễn Văn A",
            "email": "user@example.com"
          }
        }
      ]
    },
    {
      "date": "2024-10-11",
      "is_available": false,
      "bookings": [
        {
          "id": "booking-abc123",
          "status": "confirmed",
          "guest_count": 2,
          "user": {
            "id": "8752d3f6-f361-4c1f-b701-ba0761c3003b",
            "full_name": "Nguyễn Văn A",
            "email": "user@example.com"
          }
        }
      ]
    }
  ],
  "summary": {
    "total_days": 31,
    "available_days": 29,
    "booked_days": 2,
    "occupancy_rate": 6
  }
}
```

### 8. **Kiểm tra nhanh Availability**

```http
GET /bookings/room/44e8f956-8c55-46e4-9c6c-1348aadda32a/check-availability?checkInDate=2024-10-10&checkOutDate=2024-10-15
```

**Response:**
```json
{
  "room_id": "44e8f956-8c55-46e4-9c6c-1348aadda32a",
  "check_in_date": "2024-10-10",
  "check_out_date": "2024-10-15",
  "is_available": false
}
```

### 9. **Lấy Availability của tất cả phòng**

```http
GET /bookings/host/6803be8a-78a3-4c69-9eb5-9a1ae114502e/availability?startDate=2024-10-01&endDate=2024-10-31
```

**Response:**
```json
{
  "host_id": "6803be8a-78a3-4c69-9eb5-9a1ae114502e",
  "start_date": "2024-10-01",
  "end_date": "2024-10-31",
  "rooms": [
    {
      "room_id": "44e8f956-8c55-46e4-9c6c-1348aadda32a",
      "room_title": "Phòng A",
      "start_date": "2024-10-01",
      "end_date": "2024-10-31",
      "availability": [...],
      "summary": {
        "total_days": 31,
        "available_days": 29,
        "booked_days": 2,
        "occupancy_rate": 6
      }
    },
    {
      "room_id": "room-456",
      "room_title": "Phòng B",
      "start_date": "2024-10-01",
      "end_date": "2024-10-31",
      "availability": [...],
      "summary": {
        "total_days": 31,
        "available_days": 25,
        "booked_days": 6,
        "occupancy_rate": 19
      }
    }
  ]
}
```

### 10. **Xóa Booking**

```http
DELETE /bookings/booking-abc123
```

**Response:**
```json
{
  "message": "Booking deleted successfully"
}
```

## 🧪 **Test Cases cho Postman:**

### **Collection Variables:**
```
baseUrl: http://localhost:3000
hostId: 6803be8a-78a3-4c69-9eb5-9a1ae114502e
roomId: 44e8f956-8c55-46e4-9c6c-1348aadda32a
userId: 8752d3f6-f361-4c1f-b701-ba0761c3003b
bookingId: booking-abc123
```

### **Test Scripts:**

**Test tạo booking:**
```javascript
pm.test("Booking created successfully", function () {
    pm.response.to.have.status(201);
    const response = pm.response.json();
    pm.expect(response).to.have.property('id');
    pm.expect(response.status).to.eql('pending');
});
```

**Test availability:**
```javascript
pm.test("Room availability checked", function () {
    pm.response.to.have.status(200);
    const response = pm.response.json();
    pm.expect(response).to.have.property('is_available');
    pm.expect(response).to.have.property('room_id');
});
```

## 📝 **Lưu ý khi test:**

1. **Thay đổi ID**: Sử dụng ID thực tế từ database
2. **Ngày tháng**: Đảm bảo format `YYYY-MM-DD`
3. **Status**: Chỉ sử dụng các giá trị hợp lệ
4. **Authorization**: Thêm header nếu cần authentication

## 🚀 **Test Flow đề xuất:**

1. Tạo booking mới → `POST /bookings`
2. Xác nhận booking → `PATCH /bookings/{id}`
3. Kiểm tra availability → `GET /bookings/room/{roomId}/check-availability`
4. Xem lịch availability → `GET /bookings/host/{hostId}/room/{roomId}/availability`
5. Lấy thống kê → `GET /bookings/host/{hostId}/stats`
