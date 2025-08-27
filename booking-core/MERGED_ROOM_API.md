# Merged Room API - Bắt buộc có hình ảnh

## ✅ **Đã gộp `create room` và `create room with images` thành một API duy nhất!**

### **🔧 Thay đổi:**

#### **1. API Endpoint:**
```typescript
// Trước: 2 endpoints riêng biệt
POST /rooms                    // Create room không có hình
POST /rooms/with-images        // Create room có hình

// Sau: 1 endpoint duy nhất
POST /rooms                    // Create room bắt buộc có hình
```

#### **2. Controller (`src/rooms/rooms.controller.ts`):**
```typescript
@Post()
@UseInterceptors(FilesInterceptor('images', 10, {
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
}))
async create(
  @Body() createRoomDto: CreateRoomDto,
  @UploadedFiles() files: Express.Multer.File[]  // Bắt buộc có files
) {
  // Bắt buộc phải có hình ảnh
  if (!files || files.length === 0) {
    throw new HttpException(
      'Images are required when creating a room',
      HttpStatus.BAD_REQUEST
    );
  }
  
  return await this.roomsService.create(createRoomDto, files);
}
```

#### **3. Service (`src/rooms/rooms.service.ts`):**
```typescript
// Xóa method createWithGeocoding() không cần thiết
// Đổi tên createWithImages() thành create()

async create(createRoomDto: CreateRoomDto, files: Express.Multer.File[]): Promise<Room> {
  // Logic tạo room + upload hình ảnh
  // Tự động geocoding nếu không có coordinates
  // Upload hình ảnh bắt buộc
}
```

#### **4. DTOs:**
```typescript
// Xóa file create-room.dto.ts
// Đổi tên create-room-with-images.dto.ts thành create-room.dto.ts
// Cập nhật tất cả imports

export class CreateRoomDto {
  // Tất cả fields cần thiết cho room
  // Bao gồm images field
  @IsArray()
  @IsString({ each: true })
  images: string[];
}
```

### **🧪 Test Examples:**

#### **1. Create Room với Postman:**
```
Method: POST
URL: http://localhost:3000/rooms
Content-Type: multipart/form-data

Body (form-data):
- title: "Phòng đẹp"
- description: "Mô tả phòng"
- price_per_night: 500000
- address: "123 Nguyễn Huệ"
- city: "TP.HCM"
- country: "Việt Nam"
- latitude: 10.762622
- longitude: 106.660172
- postal_code: 700000
- max_guests: 2
- bedrooms: 1
- bathrooms: 1
- beds: 1
- room_type_id: "room-type-id"
- amenities: ["WiFi", "Điều hòa"]
- host_id: "host-id"
- images: [file1.jpg, file2.jpg]  // Bắt buộc có ít nhất 1 file
```

#### **2. Create Room với cURL:**
```bash
curl -X POST http://localhost:3000/rooms \
  -F "title=Phòng đẹp" \
  -F "description=Mô tả phòng" \
  -F "price_per_night=500000" \
  -F "address=123 Nguyễn Huệ" \
  -F "city=TP.HCM" \
  -F "country=Việt Nam" \
  -F "latitude=10.762622" \
  -F "longitude=106.660172" \
  -F "postal_code=700000" \
  -F "max_guests=2" \
  -F "bedrooms=1" \
  -F "bathrooms=1" \
  -F "beds=1" \
  -F "room_type_id=room-type-id" \
  -F "amenities=[\"WiFi\", \"Điều hòa\"]" \
  -F "host_id=host-id" \
  -F "images=@image1.jpg" \
  -F "images=@image2.jpg"
```

### **⚠️ Validation Rules:**

#### **1. Bắt buộc có hình ảnh:**
```typescript
if (!files || files.length === 0) {
  throw new HttpException(
    'Images are required when creating a room',
    HttpStatus.BAD_REQUEST
  );
}
```

#### **2. File validation:**
- ✅ **Chỉ chấp nhận image files**
- ✅ **Tối đa 10 files**
- ✅ **Mỗi file tối đa 5MB**

#### **3. Auto geocoding:**
```typescript
// Nếu không có coordinates, tự động lấy từ địa chỉ
if (!roomData.latitude || !roomData.longitude) {
  const fullAddress = `${roomData.address}, ${roomData.city}, ${roomData.country}`;
  const coordinates = await this.getCoordinatesFromAddress(fullAddress);
  roomData.latitude = coordinates.latitude;
  roomData.longitude = coordinates.longitude;
}
```

### **🔄 Data Flow:**

```
1. Request với form-data + files
2. Validate files (bắt buộc có)
3. Process amenities array
4. Auto geocoding (nếu cần)
5. Create room trong database
6. Upload images to Supabase Storage
7. Update room với image URLs
8. Return room data
```

### **✅ Benefits:**

- ✅ **Simplified API:** Chỉ 1 endpoint thay vì 2
- ✅ **Consistent data:** Luôn có hình ảnh
- ✅ **Better UX:** Không cần chọn endpoint
- ✅ **Auto geocoding:** Tự động lấy coordinates
- ✅ **Error handling:** Clear error messages

### **🎯 Error Handling:**

#### **1. Không có hình ảnh:**
```json
{
  "statusCode": 400,
  "message": "Images are required when creating a room"
}
```

#### **2. File không phải image:**
```json
{
  "statusCode": 400,
  "message": "Only image files are allowed"
}
```

#### **3. File quá lớn:**
```json
{
  "statusCode": 400,
  "message": "File too large"
}
```

### **📁 File Structure:**

```
src/rooms/
├── dto/
│   ├── create-room-with-images.dto.ts  // Đổi tên thành CreateRoomDto
│   ├── update-room.dto.ts              // Cập nhật import
│   └── create-room-like.dto.ts
├── entities/
│   └── room.entity.ts
├── rooms.controller.ts                 // Gộp logic
└── rooms.service.ts                    // Gộp methods
```

**API đã được gộp thành công! 🚀**
