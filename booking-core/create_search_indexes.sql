-- Indexes cho Room Search Functionality
-- Chạy file này sau khi đã tạo bảng rooms và enable PostGIS

-- 1. Kiểm tra PostGIS extension
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'postgis'
  ) THEN
    RAISE EXCEPTION 'PostGIS extension chưa được enable. Hãy chạy: CREATE EXTENSION IF NOT EXISTS postgis;';
  END IF;
END $$;

-- 2. Kiểm tra bảng rooms tồn tại
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_name = 'rooms'
  ) THEN
    RAISE EXCEPTION 'Bảng rooms chưa tồn tại. Hãy tạo bảng rooms trước.';
  END IF;
END $$;

-- 3. Spatial index cho geospatial search (chỉ tạo nếu PostGIS có sẵn)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'postgis'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_rooms_location ON rooms USING gist (
      ST_MakePoint(longitude::NUMERIC, latitude::NUMERIC)::geography
    );
    RAISE NOTICE 'Đã tạo spatial index thành công';
  END IF;
END $$;

-- 4. Composite index cho các filter thường dùng
CREATE INDEX IF NOT EXISTS idx_rooms_search ON rooms (
  is_available,
  max_guests,
  price_per_night,
  city
);

-- 5. Index cho booking availability check (chỉ tạo nếu bảng bookings tồn tại)
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

-- 6. Index cho room_type_id (foreign key)
CREATE INDEX IF NOT EXISTS idx_rooms_room_type_id ON rooms (room_type_id);

-- 7. Index cho host_id (foreign key)
CREATE INDEX IF NOT EXISTS idx_rooms_host_id ON rooms (host_id);

-- 8. Index cho created_at (sorting)
CREATE INDEX IF NOT EXISTS idx_rooms_created_at ON rooms (created_at DESC);

-- 9. Index cho price range queries
CREATE INDEX IF NOT EXISTS idx_rooms_price_range ON rooms (price_per_night);

-- 10. Index cho city searches
CREATE INDEX IF NOT EXISTS idx_rooms_city ON rooms (city);

-- 11. Index cho max_guests filter
CREATE INDEX IF NOT EXISTS idx_rooms_max_guests ON rooms (max_guests);

-- 12. Index cho latitude/longitude (fallback nếu không có PostGIS)
CREATE INDEX IF NOT EXISTS idx_rooms_lat_lng ON rooms (latitude, longitude);

-- Kiểm tra indexes đã tạo
SELECT 
  indexname, 
  indexdef 
FROM pg_indexes 
WHERE tablename = 'rooms' 
ORDER BY indexname;

-- Kiểm tra PostGIS version
SELECT PostGIS_Version() as postgis_version;
