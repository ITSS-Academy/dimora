# Room API Test Guide - Postman

## 🚀 **Hướng dẫn test API Room với Postman**

### **📋 Setup Postman:**

#### **1. Base URL:**
```
http://localhost:3000
```

#### **2. Headers (nếu cần):**
```
Content-Type: multipart/form-data
Authorization: Bearer your-token (nếu có middleware)
```

---

## **1. CREATE ROOM API**

### **Endpoint:**
```
POST /rooms
```

### **Postman Setup:**

#### **Method:** POST
#### **URL:** `http://localhost:3000/rooms`
#### **Headers:** 
- `Content-Type: multipart/form-data` (tự động set khi chọn form-data)

#### **Body (form-data):**

| Key | Type | Value | Required |
|-----|------|-------|----------|
| `title` | Text | `Phòng đẹp ở trung tâm` | ✅ Yes |
| `description` | Text | `Phòng rộng rãi, view đẹp, gần trung tâm thành phố` | ✅ Yes |
| `price_per_night` | Text | `500000` | ✅ Yes |
| `location` | Text | `Quận 1` | ✅ Yes |
| `address` | Text | `123 Nguyễn Huệ` | ✅ Yes |
| `city` | Text | `TP.HCM` | ✅ Yes |
| `country` | Text | `Việt Nam` | ✅ Yes |
| `postal_code` | Text | `700000` | ❌ No |
| `latitude` | Text | `10.762622` | ❌ No |
| `longitude` | Text | `106.660172` | ❌ No |
| `max_guests` | Text | `2` | ✅ Yes |
| `bedrooms` | Text | `1` | ✅ Yes |
| `bathrooms` | Text | `1` | ✅ Yes |
| `beds` | Text | `1` | ✅ Yes |
| `room_type_id` | Text | `your-room-type-id` | ✅ Yes |
| `amenities` | Text | `["WiFi", "Điều hòa", "Bếp", "Tủ lạnh"]` | ✅ Yes |
| `host_id` | Text | `your-host-id` | ✅ Yes |
| `images` | File | `image1.jpg` | ✅ Yes |
| `images` | File | `image2.jpg` | ✅ Yes |

#### **Example cURL:**
```bash
curl -X POST http://localhost:3000/rooms \
  -F "title=Phòng đẹp ở trung tâm" \
  -F "description=Phòng rộng rãi, view đẹp, gần trung tâm thành phố" \
  -F "price_per_night=500000" \
  -F "location=Quận 1" \
  -F "address=123 Nguyễn Huệ" \
  -F "city=TP.HCM" \
  -F "country=Việt Nam" \
  -F "postal_code=700000" \
  -F "latitude=10.762622" \
  -F "longitude=106.660172" \
  -F "max_guests=2" \
  -F "bedrooms=1" \
  -F "bathrooms=1" \
  -F "beds=1" \
  -F "room_type_id=your-room-type-id" \
  -F "amenities=[\"WiFi\", \"Điều hòa\", \"Bếp\", \"Tủ lạnh\"]" \
  -F "host_id=your-host-id" \
  -F "images=@image1.jpg" \
  -F "images=@image2.jpg"
```

#### **Expected Response (Success):**
```json
{
  "id": "room-uuid",
  "title": "Phòng đẹp ở trung tâm",
  "description": "Phòng rộng rãi, view đẹp, gần trung tâm thành phố",
  "price_per_night": 500000,
  "location": "Quận 1",
  "address": "123 Nguyễn Huệ",
  "city": "TP.HCM",
  "country": "Việt Nam",
  "postal_code": 700000,
  "latitude": 10.762622,
  "longitude": 106.660172,
  "max_guests": 2,
  "bedrooms": 1,
  "bathrooms": 1,
  "beds": 1,
  "room_type_id": "your-room-type-id",
  "amenities": ["WiFi", "Điều hòa", "Bếp", "Tủ lạnh"],
  "images": ["image-url-1", "image-url-2"],
  "host_id": "your-host-id",
  "is_available": true,
  "created_at": "2025-01-10T10:00:00Z",
  "updated_at": "2025-01-10T10:00:00Z"
}
```

#### **Expected Response (Error - No Images):**
```json
{
  "statusCode": 400,
  "message": "Images are required when creating a room"
}
```

---

## **2. UPDATE ROOM API**

### **Endpoint:**
```
PATCH /rooms/:id
```

### **Postman Setup:**

#### **Method:** PATCH
#### **URL:** `http://localhost:3000/rooms/your-room-id`
#### **Headers:** 
- `Content-Type: multipart/form-data`

#### **Body (form-data) - Update chỉ thông tin:**

| Key | Type | Value | Required |
|-----|------|-------|----------|
| `title` | Text | `Phòng đẹp mới` | ❌ No |
| `price_per_night` | Text | `600000` | ❌ No |
| `description` | Text | `Mô tả mới` | ❌ No |
| `max_guests` | Text | `3` | ❌ No |
| `host_id` | Text | `your-host-id` | ❌ No |

#### **Body (form-data) - Update thông tin + hình ảnh:**

| Key | Type | Value | Required |
|-----|------|-------|----------|
| `title` | Text | `Phòng đẹp mới` | ❌ No |
| `price_per_night` | Text | `600000` | ❌ No |
| `description` | Text | `Mô tả mới` | ❌ No |
| `max_guests` | Text | `3` | ❌ No |
| `host_id` | Text | `your-host-id` | ✅ Yes (khi có images) |
| `images` | File | `new-image1.jpg` | ❌ No |
| `images` | File | `new-image2.jpg` | ❌ No |

#### **Example cURL - Update chỉ thông tin:**
```bash
curl -X PATCH http://localhost:3000/rooms/your-room-id \
  -F "title=Phòng đẹp mới" \
  -F "price_per_night=600000" \
  -F "description=Mô tả mới" \
  -F "max_guests=3"
```

#### **Example cURL - Update thông tin + hình ảnh:**
```bash
curl -X PATCH http://localhost:3000/rooms/your-room-id \
  -F "title=Phòng đẹp mới" \
  -F "price_per_night=600000" \
  -F "description=Mô tả mới" \
  -F "max_guests=3" \
  -F "host_id=your-host-id" \
  -F "images=@new-image1.jpg" \
  -F "images=@new-image2.jpg"
```

#### **Expected Response (Success):**
```json
{
  "id": "room-uuid",
  "title": "Phòng đẹp mới",
  "description": "Mô tả mới",
  "price_per_night": 600000,
  "max_guests": 3,
  "images": ["new-image-url-1", "new-image-url-2"],
  "updated_at": "2025-01-10T11:00:00Z"
}
```

#### **Expected Response (Error - Not Owner):**
```json
{
  "statusCode": 403,
  "message": "You can only update your own rooms"
}
```

#### **Expected Response (Error - Missing host_id for images):**
```json
{
  "statusCode": 400,
  "message": "host_id is required when updating images"
}
```

---

## **3. DELETE ROOM API**

### **Endpoint:**
```
DELETE /rooms
```

### **Postman Setup:**

#### **Method:** DELETE
#### **URL:** `http://localhost:3000/rooms?id=your-room-id&host_id=your-host-id`
#### **Headers:** 
- `Content-Type: application/json` (không cần body)

#### **Query Parameters:**

| Parameter | Value | Required |
|-----------|-------|----------|
| `id` | `your-room-id` | ✅ Yes |
| `host_id` | `your-host-id` | ❌ No (nhưng cần để check ownership) |

#### **Example cURL:**
```bash
curl -X DELETE "http://localhost:3000/rooms?id=your-room-id&host_id=your-host-id"
```

#### **Expected Response (Success):**
```json
{
  "message": "Room deleted successfully"
}
```

#### **Expected Response (Error - Not Owner):**
```json
{
  "statusCode": 403,
  "message": "You can only delete your own rooms"
}
```

#### **Expected Response (Error - Room not found):**
```json
{
  "statusCode": 404,
  "message": "Room not found"
}
```

---

## **4. GET ROOM API**

### **Endpoint:**
```
GET /rooms/:id
```

### **Postman Setup:**

#### **Method:** GET
#### **URL:** `http://localhost:3000/rooms/your-room-id`
#### **Headers:** Không cần

#### **Query Parameters (Optional):**

| Parameter | Value | Required |
|-----------|-------|----------|
| `userId` | `your-user-id` | ❌ No (để check like status) |

#### **Example cURL:**
```bash
curl -X GET "http://localhost:3000/rooms/your-room-id"
```

#### **Example cURL với userId:**
```bash
curl -X GET "http://localhost:3000/rooms/your-room-id?userId=your-user-id"
```

#### **Expected Response (Success):**
```json
{
  "id": "room-uuid",
  "title": "Phòng đẹp ở trung tâm",
  "description": "Phòng rộng rãi, view đẹp",
  "price_per_night": 500000,
  "location": "Quận 1",
  "address": "123 Nguyễn Huệ",
  "city": "TP.HCM",
  "country": "Việt Nam",
  "postal_code": 700000,
  "latitude": 10.762622,
  "longitude": 106.660172,
  "max_guests": 2,
  "bedrooms": 1,
  "bathrooms": 1,
  "beds": 1,
  "room_type_id": "your-room-type-id",
  "amenities": ["WiFi", "Điều hòa", "Bếp", "Tủ lạnh"],
  "images": ["image-url-1", "image-url-2"],
  "host_id": "your-host-id",
  "is_available": true,
  "is_liked": false,
  "created_at": "2025-01-10T10:00:00Z",
  "updated_at": "2025-01-10T10:00:00Z"
}
```

---

## **5. SEARCH ROOMS API**

### **Endpoint:**
```
GET /rooms
```

### **Postman Setup:**

#### **Method:** GET
#### **URL:** `http://localhost:3000/rooms`
#### **Headers:** Không cần

#### **Query Parameters:**

| Parameter | Value | Required |
|-----------|-------|----------|
| `city` | `TP.HCM` | ❌ No |
| `checkIn` | `2025-01-15` | ❌ No |
| `checkOut` | `2025-01-20` | ❌ No |
| `guests` | `2` | ❌ No |
| `minPrice` | `100000` | ❌ No |
| `maxPrice` | `1000000` | ❌ No |
| `lat` | `10.762622` | ❌ No |
| `lng` | `106.660172` | ❌ No |
| `radius` | `5` | ❌ No |

#### **Example cURL:**
```bash
curl -X GET "http://localhost:3000/rooms?city=TP.HCM&checkIn=2025-01-15&checkOut=2025-01-20&guests=2&minPrice=100000&maxPrice=1000000&lat=10.762622&lng=106.660172&radius=5"
```

#### **Expected Response (Success):**
```json
[
  {
    "id": "room-uuid-1",
    "title": "Phòng đẹp ở trung tâm",
    "price_per_night": 500000,
    "distance_km": 0.5,
    "images": ["image-url-1", "image-url-2"]
  },
  {
    "id": "room-uuid-2",
    "title": "Phòng view đẹp",
    "price_per_night": 600000,
    "distance_km": 1.2,
    "images": ["image-url-3", "image-url-4"]
  }
]
```

---

## **6. GET HOST ROOMS API**

### **Endpoint:**
```
GET /rooms/host/:hostId
```

### **Postman Setup:**

#### **Method:** GET
#### **URL:** `http://localhost:3000/rooms/host/your-host-id`
#### **Headers:** Không cần

#### **Example cURL:**
```bash
curl -X GET "http://localhost:3000/rooms/host/your-host-id"
```

#### **Expected Response (Success):**
```json
[
  {
    "id": "room-uuid-1",
    "title": "Phòng đẹp ở trung tâm",
    "price_per_night": 500000,
    "is_available": true
  },
  {
    "id": "room-uuid-2",
    "title": "Phòng view đẹp",
    "price_per_night": 600000,
    "is_available": false
  }
]
```

---

## **⚠️ Important Notes:**

### **1. File Upload:**
- ✅ **Chỉ chấp nhận image files** (jpg, png, gif, etc.)
- ✅ **Tối đa 10 files** mỗi lần upload
- ✅ **Mỗi file tối đa 5MB**

### **2. Ownership Validation:**
- ✅ **Update/Delete** cần `host_id` để kiểm tra quyền sở hữu
- ✅ **403 Forbidden** nếu không phải chủ sở hữu

### **3. Required Fields:**
- ✅ **Create:** Tất cả fields bắt buộc + ít nhất 1 image
- ✅ **Update:** Chỉ fields cần thay đổi
- ✅ **Delete:** Chỉ cần `id` và `host_id` (optional)

### **4. Error Handling:**
- ✅ **400 Bad Request:** Validation errors
- ✅ **403 Forbidden:** Ownership errors
- ✅ **404 Not Found:** Room not found
- ✅ **500 Internal Server Error:** Server errors

---

## **🎯 Test Checklist:**

### **Create Room:**
- [ ] Test với đầy đủ thông tin + images
- [ ] Test không có images (sẽ báo lỗi)
- [ ] Test thiếu required fields
- [ ] Test với file không phải image

### **Update Room:**
- [ ] Test update chỉ thông tin
- [ ] Test update thông tin + images
- [ ] Test với host_id sai (sẽ báo lỗi)
- [ ] Test không có host_id khi upload images

### **Delete Room:**
- [ ] Test delete với host_id đúng
- [ ] Test delete với host_id sai (sẽ báo lỗi)
- [ ] Test delete room không tồn tại

### **Get Room:**
- [ ] Test get room tồn tại
- [ ] Test get room không tồn tại
- [ ] Test get room với userId

### **Search Rooms:**
- [ ] Test search với các parameters khác nhau
- [ ] Test search với coordinates
- [ ] Test search với date range

**Happy Testing! 🚀**
