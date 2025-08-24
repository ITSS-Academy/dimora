-- =====================================================
-- DATABASE SCHEMA FOR DIMORA BOOKING SYSTEM
-- =====================================================

-- =====================================================
-- 1. TẠO BẢNG USERS
-- =====================================================

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tạo index cho email để tìm kiếm nhanh
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_full_name ON users(full_name);

-- =====================================================
-- 2. TẠO BẢNG BOOKINGS
-- =====================================================

CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    host_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    guest_count INTEGER NOT NULL CHECK (guest_count > 0),
    total_amount DECIMAL(12,2) NOT NULL CHECK (total_amount >= 0),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (
        status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show', 'refunded', 'disputed')
    ),
    guest_notes TEXT,
    host_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Đảm bảo check_out_date > check_in_date
    CONSTRAINT check_dates_valid CHECK (check_out_date > check_in_date),
    
    -- Đảm bảo không có booking trùng lặp cho cùng phòng và thời gian
    -- Constraint này sẽ được thay thế bằng function check
);

-- Tạo indexes cho performance
CREATE INDEX IF NOT EXISTS idx_bookings_room_id ON bookings(room_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_host_id ON bookings(host_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(check_in_date, check_out_date);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at);

-- =====================================================
-- 3. TẠO FUNCTION ĐỂ TỰ ĐỘNG CẬP NHẬT updated_at
-- =====================================================

-- Function cho bảng users
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger cho bảng users
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger cho bảng bookings
CREATE TRIGGER update_bookings_updated_at 
    BEFORE UPDATE ON bookings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 4. TẠO FUNCTION KIỂM TRA AVAILABILITY
-- =====================================================

CREATE OR REPLACE FUNCTION check_room_availability(
    p_room_id UUID,
    p_check_in_date DATE,
    p_check_out_date DATE
)
RETURNS BOOLEAN AS $$
DECLARE
    conflicting_bookings INTEGER;
BEGIN
    -- Kiểm tra xem có booking nào active trong khoảng thời gian này không
    SELECT COUNT(*) INTO conflicting_bookings
    FROM bookings
    WHERE room_id = p_room_id
      AND check_in_date < p_check_out_date
      AND check_out_date > p_check_in_date
      AND status IN ('pending', 'confirmed', 'in_progress', 'completed');
    
    -- Trả về true nếu không có booking nào conflict
    RETURN conflicting_bookings = 0;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 4.1. TẠO FUNCTION KIỂM TRA TRÙNG LỊCH KHI INSERT/UPDATE
-- =====================================================

CREATE OR REPLACE FUNCTION check_booking_conflicts()
RETURNS TRIGGER AS $$
DECLARE
    conflicting_bookings INTEGER;
BEGIN
    -- Kiểm tra xem có booking nào active khác trùng lịch không
    SELECT COUNT(*) INTO conflicting_bookings
    FROM bookings
    WHERE room_id = NEW.room_id
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
      AND check_in_date < NEW.check_out_date
      AND check_out_date > NEW.check_in_date
      AND status IN ('pending', 'confirmed', 'in_progress', 'completed');
    
    -- Nếu có conflict và booking mới có status active
    IF conflicting_bookings > 0 AND NEW.status IN ('pending', 'confirmed', 'in_progress', 'completed') THEN
        RAISE EXCEPTION 'Room is not available for the selected dates. There are % conflicting bookings.', conflicting_bookings;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Tạo trigger để kiểm tra trùng lịch trước khi insert/update
CREATE TRIGGER check_booking_conflicts_trigger
    BEFORE INSERT OR UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION check_booking_conflicts();

-- =====================================================
-- 5. TẠO FUNCTION TÍNH TỔNG DOANH THU
-- =====================================================

CREATE OR REPLACE FUNCTION calculate_host_revenue(p_host_id UUID)
RETURNS DECIMAL(12,2) AS $$
DECLARE
    total_revenue DECIMAL(12,2);
BEGIN
    SELECT COALESCE(SUM(total_amount), 0) INTO total_revenue
    FROM bookings
    WHERE host_id = p_host_id
      AND status = 'completed';
    
    RETURN total_revenue;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 6. TẠO VIEW CHO THỐNG KÊ BOOKING
-- =====================================================

CREATE OR REPLACE VIEW booking_stats AS
SELECT 
    host_id,
    COUNT(*) as total_bookings,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_bookings,
    COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_bookings,
    COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_bookings,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_bookings,
    COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_bookings,
    COUNT(CASE WHEN status = 'no_show' THEN 1 END) as no_show_bookings,
    COUNT(CASE WHEN status = 'refunded' THEN 1 END) as refunded_bookings,
    COUNT(CASE WHEN status = 'disputed' THEN 1 END) as disputed_bookings,
    SUM(CASE WHEN status = 'completed' THEN total_amount ELSE 0 END) as total_revenue
FROM bookings
GROUP BY host_id;

-- =====================================================
-- 7. TẠO ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS cho bảng users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy cho users: User chỉ có thể xem và edit thông tin của mình
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid()::text = id::text);

-- Enable RLS cho bảng bookings
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Policy cho bookings: User có thể xem booking của mình (user_id hoặc host_id)
CREATE POLICY "Users can view own bookings" ON bookings
    FOR SELECT USING (
        auth.uid()::text = user_id::text OR 
        auth.uid()::text = host_id::text
    );

-- Policy cho bookings: User có thể tạo booking
CREATE POLICY "Users can create bookings" ON bookings
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Policy cho bookings: Host có thể update booking của mình
CREATE POLICY "Hosts can update own bookings" ON bookings
    FOR UPDATE USING (auth.uid()::text = host_id::text);

-- Policy cho bookings: User có thể delete booking của mình
CREATE POLICY "Users can delete own bookings" ON bookings
    FOR DELETE USING (
        auth.uid()::text = user_id::text OR 
        auth.uid()::text = host_id::text
    );

-- =====================================================
-- 8. INSERT SAMPLE DATA (TÙY CHỌN)
-- =====================================================

-- Insert sample users
INSERT INTO users (id, email, full_name, phone) VALUES
('8752d3f6-f361-4c1f-b701-ba0761c3003b', 'user@example.com', 'Nguyễn Văn A', '0123456789'),
('6803be8a-78a3-4c69-9eb5-9a1ae114502e', 'host@example.com', 'Trần Thị B', '0987654321')
ON CONFLICT (id) DO NOTHING;

-- Insert sample bookings (chỉ khi có room_id hợp lệ)
-- INSERT INTO bookings (room_id, user_id, host_id, check_in_date, check_out_date, guest_count, total_amount, status, guest_notes) VALUES
-- ('44e8f956-8c55-46e4-9c6c-1348aadda32a', '8752d3f6-f361-4c1f-b701-ba0761c3003b', '6803be8a-78a3-4c69-9eb5-9a1ae114502e', '2024-10-10', '2024-10-15', 2, 2500000, 'pending', 'Cần phòng yên tĩnh, view đẹp');

-- =====================================================
-- 9. COMMENTS VÀ DOCUMENTATION
-- =====================================================

COMMENT ON TABLE users IS 'Bảng lưu thông tin người dùng (user và host)';
COMMENT ON TABLE bookings IS 'Bảng lưu thông tin đặt phòng';

COMMENT ON COLUMN users.id IS 'UUID của user';
COMMENT ON COLUMN users.email IS 'Email đăng nhập (unique)';
COMMENT ON COLUMN users.full_name IS 'Họ tên đầy đủ';
COMMENT ON COLUMN users.phone IS 'Số điện thoại';
COMMENT ON COLUMN users.avatar_url IS 'URL ảnh đại diện';

COMMENT ON COLUMN bookings.id IS 'UUID của booking';
COMMENT ON COLUMN bookings.room_id IS 'ID của phòng được đặt';
COMMENT ON COLUMN bookings.user_id IS 'ID của user đặt phòng';
COMMENT ON COLUMN bookings.host_id IS 'ID của host sở hữu phòng';
COMMENT ON COLUMN bookings.check_in_date IS 'Ngày check-in';
COMMENT ON COLUMN bookings.check_out_date IS 'Ngày check-out';
COMMENT ON COLUMN bookings.guest_count IS 'Số lượng khách';
COMMENT ON COLUMN bookings.total_amount IS 'Tổng tiền (VND)';
COMMENT ON COLUMN bookings.status IS 'Trạng thái booking';
COMMENT ON COLUMN bookings.guest_notes IS 'Ghi chú từ khách';
COMMENT ON COLUMN bookings.host_notes IS 'Ghi chú từ host';

-- =====================================================
-- 10. GRANT PERMISSIONS (CHO SUPABASE)
-- =====================================================

-- Grant permissions cho authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Grant permissions cho anon users (nếu cần)
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
