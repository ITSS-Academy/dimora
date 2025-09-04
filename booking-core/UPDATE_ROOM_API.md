# Update Room API - Logic cập nhật

## ✅ **Logic Update Room đã được tối ưu!**

### **🔧 Logic Update:**

#### **1. API Endpoint:**
```typescript
PATCH /rooms/:id
Content-Type: multipart/form-data
```

#### **2. Controller Logic (`src/rooms/rooms.controller.ts`):**
```typescript
async update(
  @Param('id') id: string, 
  @Body() updateRoomDto: UpdateRoomDto,
  @UploadedFiles() files?: Express.Multer.File[]  // Optional files
) {
  // 1. Cập nhật thông tin trước
  const updatedRoom = await this.roomsService.update(id, updateRoomDto);
  
  // 2. Nếu có hình ảnh mới, thay thế hình ảnh cũ
  if (files && files.length > 0) {
    const hostId = updateRoomDto.host_id;
    if (!hostId) {
      throw new HttpException(
        'host_id is required when updating images',
        HttpStatus.BAD_REQUEST
      );
    }
    
    // Thay thế hình ảnh cũ bằng hình ảnh mới
    return await this.roomsService.updateRoomImages(id, hostId, files);
  }
  
  // 3. Nếu không có hình ảnh mới, trả về room đã cập nhật thông tin
  return updatedRoom;
}
```

### **🔄 Data Flow:**

#### **1. Update chỉ thông tin (không có hình):**
```
Request (form-data) → Update room info → Return updated room
```

#### **2. Update thông tin + hình ảnh:**
```
Request (form-data + files) → Update room info → Delete old images → Upload new images → Update room with new image URLs → Return updated room
```

### **🧪 Test Examples:**

#### **1. Update chỉ thông tin:**
```bash
curl -X PATCH http://localhost:3000/rooms/room-id \
  -F "title=Phòng đẹp mới" \
  -F "price_per_night=600000" \
  -F "description=Mô tả mới" \
  -F "max_guests=3"
```

#### **2. Update thông tin + hình ảnh:**
```bash
curl -X PATCH http://localhost:3000/rooms/room-id \
  -F "title=Phòng đẹp mới" \
  -F "price_per_night=600000" \
  -F "description=Mô tả mới" \
  -F "max_guests=3" \
  -F "host_id=host-id" \
  -F "images=@new-image1.jpg" \
  -F "images=@new-image2.jpg"
```

#### **3. Update với Postman:**
```
Method: PATCH
URL: http://localhost:3000/rooms/room-id
Content-Type: multipart/form-data

Body (form-data):
- title: "Phòng đẹp mới"
- price_per_night: 600000
- description: "Mô tả mới"
- max_guests: 3
- host_id: "host-id"  // Bắt buộc nếu có images
- images: [new-image1.jpg, new-image2.jpg]  // Optional
```

### **⚠️ Validation Rules:**

#### **1. Update thông tin:**
- ✅ **Không cần host_id** nếu không có hình ảnh
- ✅ **Partial update** - chỉ cập nhật fields được gửi
- ✅ **Auto geocoding** nếu thay đổi địa chỉ

#### **2. Update hình ảnh:**
- ✅ **Bắt buộc có host_id** khi upload hình ảnh
- ✅ **Xóa hình ảnh cũ** trước khi upload mới
- ✅ **File validation:** Chỉ image files, tối đa 10 files, mỗi file 5MB

### **🎯 Service Methods:**

#### **1. `update(id, updateRoomDto)` - Cập nhật thông tin:**
```typescript
async update(id: string, updateRoomDto: UpdateRoomDto): Promise<Room> {
  // Cập nhật thông tin room trong database
  // Tự động geocoding nếu thay đổi địa chỉ
  // Return room đã cập nhật
}
```

#### **2. `updateRoomImages(roomId, hostId, files)` - Cập nhật hình ảnh:**
```typescript
async updateRoomImages(roomId: string, hostId: string, files: Express.Multer.File[]): Promise<Room> {
  // 1. Xóa hình ảnh cũ từ Supabase Storage
  await this.supabaseService.deleteRoomImages(hostId, roomId);
  
  // 2. Upload hình ảnh mới
  const imageUrls = await this.supabaseService.uploadRoomImages(hostId, roomId, files);
  
  // 3. Cập nhật room với URLs mới
  const updatedRoom = await this.update(roomId, { images: imageUrls });
  
  return updatedRoom;
}
```

### **✅ Benefits:**

- ✅ **Flexible update:** Có thể update chỉ thông tin hoặc cả thông tin + hình
- ✅ **Image replacement:** Thay thế hoàn toàn hình ảnh cũ bằng mới
- ✅ **Auto geocoding:** Tự động cập nhật coordinates nếu thay đổi địa chỉ
- ✅ **Error handling:** Clear error messages cho từng trường hợp

### **🎯 Error Handling:**

#### **1. Không có host_id khi upload hình:**
```json
{
  "statusCode": 400,
  "message": "host_id is required when updating images"
}
```

#### **2. File không phải image:**
```json
{
  "statusCode": 400,
  "message": "Only image files are allowed"
}
```

#### **3. Room không tồn tại:**
```json
{
  "statusCode": 404,
  "message": "Room not found"
}
```

### **📊 Comparison với Create API:**

| Feature | Create API | Update API |
|---------|------------|------------|
| **Hình ảnh** | Bắt buộc có | Optional |
| **host_id** | Bắt buộc | Chỉ cần khi có hình |
| **Auto geocoding** | Có | Có (nếu thay đổi địa chỉ) |
| **Image handling** | Upload mới | Thay thế hoàn toàn |

### **🔄 Auto Geocoding Logic:**

```typescript
// Trong update method
if (updateRoomDto.address || updateRoomDto.city || updateRoomDto.country) {
  // Nếu thay đổi địa chỉ và không có coordinates mới
  if (!updateRoomDto.latitude || !updateRoomDto.longitude) {
    const fullAddress = `${updateRoomDto.address}, ${updateRoomDto.city}, ${updateRoomDto.country}`;
    const coordinates = await this.getCoordinatesFromAddress(fullAddress);
    updateRoomDto.latitude = coordinates.latitude;
    updateRoomDto.longitude = coordinates.longitude;
  }
}
```

**Update API đã được tối ưu! 🚀**
