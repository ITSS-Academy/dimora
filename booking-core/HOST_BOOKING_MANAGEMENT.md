# Quản lý Booking cho Host

## Tổng quan

Hệ thống cung cấp các tính năng để host có thể xem và quản lý tất cả booking của các phòng của họ, bao gồm:
- Xem tất cả booking của host
- Xem booking của từng phòng cụ thể
- Xem booking theo khoảng thời gian
- Thống kê booking và doanh thu

## API Endpoints

### 1. Lấy tất cả booking của host

```http
GET /bookings/host/{hostId}
```

Response:
```json
[
  {
    "id": "booking-123",
    "room_id": "room-456",
    "user_id": "user-789",
    "check_in_date": "2024-01-15T00:00:00.000Z",
    "check_out_date": "2024-01-17T00:00:00.000Z",
    "guest_count": 2,
    "total_amount": 1000000,
    "status": "confirmed",
    "user_notes": "Cần sớm check-in",
    "host_notes": "Đã chuẩn bị phòng",
    "created_at": "2024-01-10T10:00:00.000Z",
    "updated_at": "2024-01-10T10:00:00.000Z",
    "rooms": {
      "id": "room-456",
      "title": "Phòng đẹp ở Quận 1",
      "address": "123 Nguyễn Huệ",
      "city": "TP.HCM",
      "country": "Việt Nam"
    },
    "users": {
      "id": "user-789",
      "email": "user@example.com",
      "full_name": "Nguyễn Văn A",
      "phone": "0123456789"
    }
  }
]
```

### 2. Lấy booking của một phòng cụ thể

```http
GET /bookings/host/{hostId}/room/{roomId}
```

Response:
```json
[
  {
    "id": "booking-123",
    "room_id": "room-456",
    "user_id": "user-789",
    "check_in_date": "2024-01-15T00:00:00.000Z",
    "check_out_date": "2024-01-17T00:00:00.000Z",
    "guest_count": 2,
    "total_amount": 1000000,
    "status": "confirmed",
    "user_notes": "Cần sớm check-in",
    "host_notes": "Đã chuẩn bị phòng",
    "created_at": "2024-01-10T10:00:00.000Z",
    "updated_at": "2024-01-10T10:00:00.000Z",
    "users": {
      "id": "user-789",
      "email": "user@example.com",
      "full_name": "Nguyễn Văn A",
      "phone": "0123456789"
    }
  }
]
```

### 3. Lấy booking theo khoảng thời gian

```http
GET /bookings/host/{hostId}/date-range?startDate=2024-01-01&endDate=2024-01-31
```

Parameters:
- `startDate`: Ngày bắt đầu (YYYY-MM-DD)
- `endDate`: Ngày kết thúc (YYYY-MM-DD)

Response: Tương tự như endpoint 1, nhưng chỉ lấy booking trong khoảng thời gian

### 4. Lấy thống kê booking của host

```http
GET /bookings/host/{hostId}/stats
```

Response:
```json
{
  "total_bookings": 25,
  "status_counts": {
    "pending": 5,
    "confirmed": 15,
    "cancelled": 3,
    "completed": 2
  },
  "total_revenue": 25000000,
  "completed_bookings": 2,
  "pending_bookings": 5,
  "cancelled_bookings": 3
}
```

### 5. Lấy lịch availability của một phòng

```http
GET /bookings/host/{hostId}/room/{roomId}/availability?startDate=2024-10-01&endDate=2024-10-31
```

Response:
```json
{
  "room_id": "room-456",
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
          "id": "booking-123",
          "status": "confirmed",
          "guest_count": 2,
          "user": {
            "id": "user-789",
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
          "id": "booking-123",
          "status": "confirmed",
          "guest_count": 2,
          "user": {
            "id": "user-789",
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

### 6. Lấy availability của tất cả phòng của host

```http
GET /bookings/host/{hostId}/availability?startDate=2024-10-01&endDate=2024-10-31
```

Response:
```json
{
  "host_id": "host-123",
  "start_date": "2024-10-01",
  "end_date": "2024-10-31",
  "rooms": [
    {
      "room_id": "room-456",
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
      "room_id": "room-789",
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

### 7. Kiểm tra availability của phòng

```http
GET /bookings/room/{roomId}/check-availability?checkInDate=2024-10-10&checkOutDate=2024-10-15
```

Response:
```json
{
  "room_id": "room-456",
  "check_in_date": "2024-10-10",
  "check_out_date": "2024-10-15",
  "is_available": false
}
```

## Database Schema

### Bảng bookings

```sql
CREATE TABLE bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    host_id UUID NOT NULL,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    guest_count INTEGER NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    user_notes TEXT,
    host_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_bookings_host_id ON bookings(host_id);
CREATE INDEX idx_bookings_room_id ON bookings(room_id);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_check_in_date ON bookings(check_in_date);
CREATE INDEX idx_bookings_status ON bookings(status);
```

### Bảng users (nếu chưa có)

```sql
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Tính năng

### 1. Bảo mật
- Host chỉ có thể xem booking của các phòng thuộc về họ
- Kiểm tra quyền truy cập trước khi trả về dữ liệu

### 2. Thông tin chi tiết
- Thông tin đầy đủ về phòng (title, address, city, country)
- Thông tin user (email, full_name, phone)
- Ghi chú từ user và host
- Trạng thái booking

### 3. Thống kê
- Tổng số booking
- Số lượng theo từng trạng thái
- Tổng doanh thu từ booking đã hoàn thành

### 4. Lọc và tìm kiếm
- Lọc theo phòng cụ thể
- Lọc theo khoảng thời gian
- Sắp xếp theo ngày tạo hoặc ngày check-in

### 5. Availability Management
- Xem lịch availability của từng phòng
- Xem availability của tất cả phòng
- Kiểm tra nhanh availability cho một khoảng thời gian
- Tính toán tỷ lệ occupancy
- Phân biệt booking status (cancelled, no_show, refunded không tính là booked)

## Sử dụng với Frontend

### Dashboard cho Host

```javascript
// Lấy thống kê tổng quan
const stats = await fetch('/bookings/host/host-123/stats').then(r => r.json());

// Lấy danh sách booking gần đây
const recentBookings = await fetch('/bookings/host/host-123').then(r => r.json());

// Lấy booking theo tháng
const monthlyBookings = await fetch('/bookings/host/host-123/date-range?startDate=2024-01-01&endDate=2024-01-31').then(r => r.json());
```

### Calendar View

```javascript
// Lấy booking của một phòng để hiển thị trên calendar
const roomBookings = await fetch('/bookings/host/host-123/room/room-456').then(r => r.json());

// Hiển thị trên calendar
roomBookings.forEach(booking => {
  calendar.addEvent({
    title: `${booking.users.full_name} - ${booking.guest_count} khách`,
    start: booking.check_in_date,
    end: booking.check_out_date,
    color: getStatusColor(booking.status)
  });
});
```

### Availability Calendar

```javascript
// Lấy availability của phòng
const availability = await fetch('/bookings/host/host-123/room/room-456/availability?startDate=2024-10-01&endDate=2024-10-31').then(r => r.json());

// Hiển thị availability trên calendar
availability.availability.forEach(day => {
  if (day.is_available) {
    calendar.addEvent({
      title: 'Available',
      start: day.date,
      end: day.date,
      color: '#28a745', // Green
      display: 'background'
    });
  } else {
    day.bookings.forEach(booking => {
      calendar.addEvent({
        title: `${booking.user.full_name} - ${booking.guest_count} khách`,
        start: day.date,
        end: day.date,
        color: getStatusColor(booking.status)
      });
    });
  }
});
```

### Quick Availability Check

```javascript
// Kiểm tra nhanh availability
const checkAvailability = async (roomId, checkIn, checkOut) => {
  const response = await fetch(`/bookings/room/${roomId}/check-availability?checkInDate=${checkIn}&checkOutDate=${checkOut}`);
  const result = await response.json();
  
  if (result.is_available) {
    console.log('Phòng có sẵn!');
  } else {
    console.log('Phòng đã được book!');
  }
};
```

## Lưu ý

1. **Authentication**: Cần implement JWT authentication để lấy hostId từ token
2. **Pagination**: Có thể thêm pagination cho danh sách booking lớn
3. **Real-time**: Có thể thêm WebSocket để cập nhật real-time khi có booking mới
4. **Export**: Có thể thêm tính năng export booking ra Excel/PDF
