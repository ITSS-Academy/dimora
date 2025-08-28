-- Setup PostGIS và Indexes - Hướng dẫn từng bước
-- Chạy từng lệnh một và kiểm tra kết quả

-- Bước 1: Kiểm tra PostgreSQL version
SELECT version();

-- Bước 2: Kiểm tra các extensions hiện có
SELECT extname, extversion FROM pg_extension ORDER BY extname;

-- Bước 3: Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Bước 4: Kiểm tra PostGIS đã được enable
SELECT PostGIS_Version();

-- Bước 5: Kiểm tra bảng rooms tồn tại
SELECT table_name FROM information_schema.tables WHERE table_name = 'rooms';

-- Bước 6: Kiểm tra cấu trúc bảng rooms
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'rooms' 
ORDER BY ordinal_position;

-- Bước 7: Tạo spatial index (chỉ chạy nếu PostGIS đã enable)
-- Nếu bước 4 thành công, chạy lệnh này:
CREATE INDEX IF NOT EXISTS idx_rooms_location ON rooms USING gist (
  ST_MakePoint(longitude::NUMERIC, latitude::NUMERIC)::geography
);

-- Bước 8: Tạo các indexes khác
CREATE INDEX IF NOT EXISTS idx_rooms_search ON rooms (
  is_available, max_guests, price_per_night, city
);

CREATE INDEX IF NOT EXISTS idx_rooms_lat_lng ON rooms (latitude, longitude);

-- Bước 9: Kiểm tra indexes đã tạo
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'rooms' 
ORDER BY indexname;

-- Bước 10: Test PostGIS functions
SELECT 
  ST_Distance(
    ST_MakePoint(106.660172, 10.762622)::geography,
    ST_MakePoint(106.7009, 10.7769)::geography
  ) / 1000.0 as distance_km;

-- Nếu tất cả thành công, bạn có thể chạy RPC functions
