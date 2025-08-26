# User API Test Examples

## 🧪 Test API User

### 1. **Tạo User mới**

```http
POST /users
Content-Type: application/json
```

**Body:**
```json
{
  "id": "8752d3f6-f361-4c1f-b701-ba0761c3003b",
  "email": "user@example.com",
  "full_name": "Nguyễn Văn A",
  "phone": "0123456789",
  "avatar_url": "https://example.com/avatar.jpg"
}
```

**Response thành công:**
```json
{
  "id": "8752d3f6-f361-4c1f-b701-ba0761c3003b",
  "email": "user@example.com",
  "full_name": "Nguyễn Văn A",
  "phone": "0123456789",
  "avatar_url": "https://example.com/avatar.jpg",
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T10:30:00.000Z"
}
```

### 2. **Lấy tất cả Users**

```http
GET /users
```

**Response:**
```json
[
  {
    "id": "8752d3f6-f361-4c1f-b701-ba0761c3003b",
    "email": "user@example.com",
    "full_name": "Nguyễn Văn A",
    "phone": "0123456789",
    "avatar_url": "https://example.com/avatar.jpg",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  },
  {
    "id": "6803be8a-78a3-4c69-9eb5-9a1ae114502e",
    "email": "host@example.com",
    "full_name": "Trần Thị B",
    "phone": "0987654321",
    "avatar_url": null,
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
]
```

### 3. **Lấy User theo ID**

```http
GET /users/8752d3f6-f361-4c1f-b701-ba0761c3003b
```

**Response:**
```json
{
  "id": "8752d3f6-f361-4c1f-b701-ba0761c3003b",
  "email": "user@example.com",
  "full_name": "Nguyễn Văn A",
  "phone": "0123456789",
  "avatar_url": "https://example.com/avatar.jpg",
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T10:30:00.000Z"
}
```

### 4. **Cập nhật User**

```http
PATCH /users/8752d3f6-f361-4c1f-b701-ba0761c3003b
Content-Type: application/json
```

**Body:**
```json
{
  "full_name": "Nguyễn Văn A (Updated)",
  "phone": "0987654321",
  "avatar_url": "https://example.com/new-avatar.jpg"
}
```

**Response:**
```json
{
  "id": "8752d3f6-f361-4c1f-b701-ba0761c3003b",
  "email": "user@example.com",
  "full_name": "Nguyễn Văn A (Updated)",
  "phone": "0987654321",
  "avatar_url": "https://example.com/new-avatar.jpg",
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T11:00:00.000Z"
}
```

### 5. **Xóa User**

```http
DELETE /users/8752d3f6-f361-4c1f-b701-ba0761c3003b
```

**Response:**
```json
{
  "message": "User deleted successfully"
}
```

## 🧪 **Test Cases cho Postman:**

### **Collection Variables:**
```
baseUrl: http://localhost:3000
userId: 8752d3f6-f361-4c1f-b701-ba0761c3003b
```

### **Test Scripts:**

**Test tạo user:**
```javascript
pm.test("User created successfully", function () {
    pm.response.to.have.status(201);
    const response = pm.response.json();
    pm.expect(response).to.have.property('id');
    pm.expect(response).to.have.property('email');
    pm.expect(response).to.have.property('full_name');
});
```

**Test validation:**
```javascript
pm.test("Email validation", function () {
    if (pm.response.code === 400) {
        const response = pm.response.json();
        pm.expect(response.message).to.include('email');
    }
});
```

## 📝 **Lưu ý khi test:**

1. **ID User**: Phải là UUID hợp lệ
2. **Email**: Phải là email hợp lệ và unique
3. **Full Name**: Bắt buộc phải có
4. **Phone & Avatar**: Tùy chọn

## 🚀 **Test Flow đề xuất:**

1. Tạo user mới → `POST /users`
2. Lấy danh sách users → `GET /users`
3. Lấy user cụ thể → `GET /users/{id}`
4. Cập nhật user → `PATCH /users/{id}`
5. Xóa user → `DELETE /users/{id}`

## 🔗 **Liên kết với Booking API:**

Sau khi tạo users, bạn có thể test booking API với các ID users đã tạo:

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
