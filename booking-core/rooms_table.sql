-- =====================================================
-- TẠO BẢNG ROOMS CHO DIMORA BOOKING SYSTEM
-- =====================================================

CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    host_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    country TEXT NOT NULL DEFAULT 'Việt Nam',
      latitude NUMERIC,
  longitude NUMERIC,
  postal_code NUMERIC,
    price_per_night DECIMAL(12,2) NOT NULL CHECK (price_per_night >= 0),
    max_guests INTEGER NOT NULL DEFAULT 1 CHECK (max_guests > 0),
    bedroom_count INTEGER DEFAULT 1 CHECK (bedroom_count > 0),
    bathroom_count INTEGER DEFAULT 1 CHECK (bathroom_count > 0),
    amenities TEXT[], -- Array of amenities
    images TEXT[], -- Array of image URLs
    is_available BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tạo indexes cho performance
CREATE INDEX IF NOT EXISTS idx_rooms_host_id ON rooms(host_id);
CREATE INDEX IF NOT EXISTS idx_rooms_city ON rooms(city);
CREATE INDEX IF NOT EXISTS idx_rooms_price ON rooms(price_per_night);
CREATE INDEX IF NOT EXISTS idx_rooms_available ON rooms(is_available);
CREATE INDEX IF NOT EXISTS idx_rooms_verified ON rooms(is_verified);
CREATE INDEX IF NOT EXISTS idx_rooms_created_at ON rooms(created_at);

-- Tạo GIST index cho geospatial search (nếu có extension)
-- CREATE INDEX IF NOT EXISTS idx_rooms_location ON rooms USING gist (ll_to_earth(CAST(latitude AS FLOAT), CAST(longitude AS FLOAT)));

-- Trigger để tự động cập nhật updated_at
CREATE TRIGGER update_rooms_updated_at 
    BEFORE UPDATE ON rooms 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS cho bảng rooms
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

-- Policy cho rooms: Host chỉ có thể quản lý phòng của mình
CREATE POLICY "Hosts can view own rooms" ON rooms
    FOR SELECT USING (auth.uid()::text = host_id::text);

CREATE POLICY "Hosts can insert own rooms" ON rooms
    FOR INSERT WITH CHECK (auth.uid()::text = host_id::text);

CREATE POLICY "Hosts can update own rooms" ON rooms
    FOR UPDATE USING (auth.uid()::text = host_id::text);

CREATE POLICY "Hosts can delete own rooms" ON rooms
    FOR DELETE USING (auth.uid()::text = host_id::text);

-- Policy cho public: Mọi người có thể xem phòng available
CREATE POLICY "Public can view available rooms" ON rooms
    FOR SELECT USING (is_available = true AND is_verified = true);

-- Comments
COMMENT ON TABLE rooms IS 'Bảng lưu thông tin phòng cho thuê';
COMMENT ON COLUMN rooms.id IS 'UUID của phòng';
COMMENT ON COLUMN rooms.host_id IS 'ID của host sở hữu phòng';
COMMENT ON COLUMN rooms.title IS 'Tiêu đề phòng';
COMMENT ON COLUMN rooms.description IS 'Mô tả chi tiết phòng';
COMMENT ON COLUMN rooms.address IS 'Địa chỉ chi tiết';
COMMENT ON COLUMN rooms.city IS 'Thành phố';
COMMENT ON COLUMN rooms.country IS 'Quốc gia';
COMMENT ON COLUMN rooms.latitude IS 'Vĩ độ (string)';
COMMENT ON COLUMN rooms.longitude IS 'Kinh độ (string)';
COMMENT ON COLUMN rooms.price_per_night IS 'Giá phòng/đêm (VND)';
COMMENT ON COLUMN rooms.max_guests IS 'Số khách tối đa';
COMMENT ON COLUMN rooms.bedroom_count IS 'Số phòng ngủ';
COMMENT ON COLUMN rooms.bathroom_count IS 'Số phòng tắm';
COMMENT ON COLUMN rooms.amenities IS 'Danh sách tiện ích (array)';
COMMENT ON COLUMN rooms.images IS 'Danh sách ảnh (array)';
COMMENT ON COLUMN rooms.is_available IS 'Phòng có sẵn không';
COMMENT ON COLUMN rooms.is_verified IS 'Phòng đã được xác thực chưa';

-- Insert sample room (tùy chọn)
INSERT INTO rooms (id, host_id, title, description, address, city, country, latitude, longitude, price_per_night, max_guests, bedroom_count, bathroom_count, amenities, is_available, is_verified) VALUES
('44e8f956-8c55-46e4-9c6c-1348aadda32a', '6803be8a-78a3-4c69-9eb5-9a1ae114502e', 'Phòng đẹp ở Quận 1', 'Phòng view đẹp, gần trung tâm', '123 Nguyễn Huệ, Quận 1', 'TP.HCM', 'Việt Nam', '10.7769', '106.7009', 500000, 2, 1, 1, ARRAY['WiFi', 'Điều hòa', 'Bếp', 'Tủ lạnh'], true, true)
ON CONFLICT (id) DO NOTHING;
