-- Indexes đơn giản cho Room Search (KHÔNG sử dụng PostGIS)
-- Chạy file này nếu PostGIS không hoạt động

-- 1. Kiểm tra bảng rooms tồn tại
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_name = 'rooms'
  ) THEN
    RAISE EXCEPTION 'Bảng rooms chưa tồn tại. Hãy tạo bảng rooms trước.';
  END IF;
END $$;

-- 2. Index cho latitude/longitude (cho distance calculation)
CREATE INDEX IF NOT EXISTS idx_rooms_lat_lng ON rooms (latitude, longitude);

-- 3. Composite index cho các filter thường dùng
CREATE INDEX IF NOT EXISTS idx_rooms_search ON rooms (
  is_available,
  max_guests,
  price_per_night,
  city
);

-- 4. Index cho booking availability check (chỉ tạo nếu bảng bookings tồn tại)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_name = 'bookings'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_bookings_availability ON bookings (
      room_id,
      check_in_date,
      check_out_date,
      status
    );
    RAISE NOTICE 'Đã tạo booking availability index thành công';
  ELSE
    RAISE NOTICE 'Bảng bookings chưa tồn tại, bỏ qua booking index';
  END IF;
END $$;

-- 5. Index cho room_type_id (foreign key)
CREATE INDEX IF NOT EXISTS idx_rooms_room_type_id ON rooms (room_type_id);

-- 6. Index cho host_id (foreign key)
CREATE INDEX IF NOT EXISTS idx_rooms_host_id ON rooms (host_id);

-- 7. Index cho created_at (sorting)
CREATE INDEX IF NOT EXISTS idx_rooms_created_at ON rooms (created_at DESC);

-- 8. Index cho price range queries
CREATE INDEX IF NOT EXISTS idx_rooms_price_range ON rooms (price_per_night);

-- 9. Index cho city searches
CREATE INDEX IF NOT EXISTS idx_rooms_city ON rooms (city);

-- 10. Index cho max_guests filter
CREATE INDEX IF NOT EXISTS idx_rooms_max_guests ON rooms (max_guests);

-- Kiểm tra indexes đã tạo
SELECT 
  indexname, 
  indexdef 
FROM pg_indexes 
WHERE tablename = 'rooms' 
ORDER BY indexname;

-- Test distance calculation function
SELECT calculate_distance_km(10.762622, 106.660172, 10.7769, 106.7009) as distance_km;
