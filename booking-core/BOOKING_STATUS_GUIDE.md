# Booking Status Guide

## 📋 Tổng quan về Booking Status

Booking status được sử dụng để theo dõi và quản lý trạng thái của một booking từ khi được tạo cho đến khi hoàn thành.

## 🏷️ Các trạng thái Booking

### 1. **`pending`** - Chờ xác nhận
- **Khi nào**: Khi user vừa tạo booking
- **Mục đích**: 
  - Host cần xem và xác nhận booking
  - User chưa được đảm bảo phòng
  - Có thể bị từ chối nếu phòng không khả dụng

### 2. **`confirmed`** - Đã xác nhận
- **Khi nào**: Host đã xác nhận booking
- **Mục đích**:
  - User đã được đảm bảo phòng
  - Host cần chuẩn bị phòng
  - Có thể hủy nhưng có thể mất phí

### 3. **`in_progress`** - Đang sử dụng
- **Khi nào**: User đã check-in và đang ở trong phòng
- **Mục đích**:
  - Theo dõi thời gian thực tế user ở trong phòng
  - Tính toán doanh thu chính xác
  - Quản lý dịch vụ trong thời gian lưu trú

### 4. **`completed`** - Đã hoàn thành
- **Khi nào**: User đã check-out
- **Mục đích**:
  - Tính doanh thu cho host
  - User có thể đánh giá phòng
  - Thống kê hiệu suất

### 5. **`cancelled`** - Đã hủy
- **Khi nào**: Booking bị hủy bởi user hoặc host
- **Mục đích**:
  - Ghi lại lý do hủy
  - Tính toán phí hủy (nếu có)
  - Thống kê tỷ lệ hủy

### 6. **`no_show`** - Không đến
- **Khi nào**: User không đến check-in
- **Mục đích**:
  - Tính toán tỷ lệ no-show
  - Có thể tính phí no-show
  - Cải thiện quy trình booking

### 7. **`refunded`** - Đã hoàn tiền
- **Khi nào**: Booking đã được hoàn tiền
- **Mục đích**:
  - Theo dõi các booking đã hoàn tiền
  - Tính toán doanh thu thực tế
  - Quản lý tài chính

### 8. **`disputed`** - Có tranh chấp
- **Khi nào**: Có vấn đề với booking
- **Mục đích**:
  - Theo dõi các trường hợp cần giải quyết
  - Quản lý khiếu nại
  - Cải thiện dịch vụ

## 🔄 Workflow Booking

```
User tạo booking → pending
         ↓
Host xem và xác nhận → confirmed
         ↓
User check-in → in_progress
         ↓
User check-out → completed
```

## 📊 Phân loại trạng thái

### **Active Status** (Tính là đã book)
- `pending`
- `confirmed` 
- `in_progress`
- `completed`

### **Inactive Status** (Không tính là đã book)
- `cancelled`
- `no_show`
- `refunded`
- `disputed`

## 🎯 Lợi ích của Booking Status

### **Cho Host:**
1. **Quản lý phòng**: Biết phòng nào đã được book, đang chờ xác nhận
2. **Chuẩn bị**: Biết khi nào cần dọn phòng, đón khách
3. **Thống kê**: Tính doanh thu, tỷ lệ occupancy
4. **Lịch trình**: Lên kế hoạch dọn phòng, bảo trì

### **Cho User:**
1. **Yên tâm**: Biết booking đã được xác nhận chưa
2. **Lên kế hoạch**: Biết chắc chắn có phòng để đi
3. **Hủy đổi**: Biết có thể hủy không và mất phí bao nhiêu

### **Cho Hệ thống:**
1. **Tự động hóa**: Tự động cập nhật trạng thái
2. **Thông báo**: Gửi email/SMS theo trạng thái
3. **Báo cáo**: Thống kê hiệu suất kinh doanh

## 📈 Ví dụ sử dụng trong thống kê

```json
{
  "total_bookings": 100,
  "status_counts": {
    "pending": 10,      // 10% chờ xác nhận
    "confirmed": 60,    // 60% đã xác nhận
    "in_progress": 5,   // 5% đang sử dụng
    "completed": 15,    // 15% đã hoàn thành
    "cancelled": 8,     // 8% đã hủy
    "no_show": 2        // 2% không đến
  },
  "total_revenue": 15000000,  // Chỉ tính từ completed
  "occupancy_rate": 75        // Tỷ lệ phòng được sử dụng
}
```

## 🛠️ API Endpoints liên quan

### 1. **Cập nhật trạng thái booking**
```http
PATCH /bookings/{id}
```

Body:
```json
{
  "status": "confirmed"
}
```

### 2. **Lấy booking theo trạng thái**
```http
GET /bookings/host/{hostId}?status=confirmed
```

### 3. **Thống kê theo trạng thái**
```http
GET /bookings/host/{hostId}/stats
```

### 4. **Availability check** (chỉ tính active status)
```http
GET /bookings/room/{roomId}/check-availability?checkInDate=2024-10-10&checkOutDate=2024-10-15
```

## 💡 Ví dụ thực tế

### **Host nhận được booking mới:**
```
Booking #123 - Phòng A
Status: pending
User: Nguyễn Văn A
Check-in: 15/01/2024
Check-out: 17/01/2024
```

### **Host xác nhận:**
```
Booking #123 - Phòng A
Status: confirmed ✅
→ Gửi email xác nhận cho user
→ Chuẩn bị phòng
→ Cập nhật lịch
```

### **User check-in:**
```
Booking #123 - Phòng A
Status: in_progress ✅
→ Bắt đầu tính thời gian thực tế
→ Cung cấp dịch vụ
→ Theo dõi feedback
```

### **User check-out:**
```
Booking #123 - Phòng A
Status: completed ✅
→ Tính doanh thu: 1,000,000 VND
→ Gửi email đánh giá cho user
→ Dọn phòng cho booking tiếp theo
```

## 🔮 Tính năng có thể mở rộng

### **Tự động hóa:**
- Tự động chuyển `pending` → `cancelled` sau 24h nếu host không xác nhận
- Tự động chuyển `confirmed` → `in_progress` vào ngày check-in
- Tự động chuyển `in_progress` → `completed` sau ngày check-out

### **Thông báo:**
- Email reminder cho user trước ngày check-in
- SMS thông báo cho host khi có booking mới
- Push notification cho status changes

### **Báo cáo:**
- Báo cáo tỷ lệ occupancy theo từng trạng thái
- Phân tích xu hướng booking theo thời gian
- Dự đoán doanh thu dựa trên booking pipeline

Booking status giúp quản lý toàn bộ quy trình từ đặt phòng đến hoàn thành một cách có hệ thống! 🏨
