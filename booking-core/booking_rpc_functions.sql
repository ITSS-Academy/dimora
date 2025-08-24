-- RPC Functions cho Booking APIs
-- Chạy trong Supabase SQL Editor

-- 1. Function để lấy host bookings với room và user info
CREATE OR REPLACE FUNCTION get_host_bookings(host_uuid UUID)
RETURNS TABLE (
  id UUID,
  room_id UUID,
  user_id UUID,
  host_id UUID,
  check_in_date DATE,
  check_out_date DATE,
  guest_count INTEGER,
  total_amount DECIMAL,
  status TEXT,
  guest_notes TEXT,
  host_notes TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  room_title TEXT,
  room_address TEXT,
  room_city TEXT,
  room_country TEXT,
  user_email TEXT,
  user_full_name TEXT,
  user_phone TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id,
    b.room_id,
    b.user_id,
    b.host_id,
    b.check_in_date,
    b.check_out_date,
    b.guest_count,
    b.total_amount,
    b.status,
    b.guest_notes,
    b.host_notes,
    b.created_at,
    b.updated_at,
    r.title as room_title,
    r.address as room_address,
    r.city as room_city,
    r.country as room_country,
    u.email as user_email,
    u.full_name as user_full_name,
    u.phone as user_phone
  FROM bookings b
  LEFT JOIN rooms r ON b.room_id = r.id
  LEFT JOIN users u ON b.user_id = u.id
  WHERE b.host_id = host_uuid
  ORDER BY b.created_at DESC;
END;
$$;

-- 2. Function để lấy room bookings với user info
CREATE OR REPLACE FUNCTION get_room_bookings(room_uuid UUID, host_uuid UUID)
RETURNS TABLE (
  id UUID,
  room_id UUID,
  user_id UUID,
  host_id UUID,
  check_in_date DATE,
  check_out_date DATE,
  guest_count INTEGER,
  total_amount DECIMAL,
  status TEXT,
  guest_notes TEXT,
  host_notes TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  user_email TEXT,
  user_full_name TEXT,
  user_phone TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Kiểm tra room có thuộc host không
  IF NOT EXISTS (
    SELECT 1 FROM rooms 
    WHERE id = room_uuid AND host_id = host_uuid
  ) THEN
    RAISE EXCEPTION 'Access denied: Room does not belong to this host';
  END IF;

  RETURN QUERY
  SELECT 
    b.id,
    b.room_id,
    b.user_id,
    b.host_id,
    b.check_in_date,
    b.check_out_date,
    b.guest_count,
    b.total_amount,
    b.status,
    b.guest_notes,
    b.host_notes,
    b.created_at,
    b.updated_at,
    u.email as user_email,
    u.full_name as user_full_name,
    u.phone as user_phone
  FROM bookings b
  LEFT JOIN users u ON b.user_id = u.id
  WHERE b.room_id = room_uuid
  ORDER BY b.check_in_date ASC;
END;
$$;

-- 3. Function để lấy host bookings theo date range
CREATE OR REPLACE FUNCTION get_host_bookings_by_date_range(
  host_uuid UUID,
  start_date DATE,
  end_date DATE
)
RETURNS TABLE (
  id UUID,
  room_id UUID,
  user_id UUID,
  host_id UUID,
  check_in_date DATE,
  check_out_date DATE,
  guest_count INTEGER,
  total_amount DECIMAL,
  status TEXT,
  guest_notes TEXT,
  host_notes TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  room_title TEXT,
  room_address TEXT,
  room_city TEXT,
  room_country TEXT,
  user_email TEXT,
  user_full_name TEXT,
  user_phone TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id,
    b.room_id,
    b.user_id,
    b.host_id,
    b.check_in_date,
    b.check_out_date,
    b.guest_count,
    b.total_amount,
    b.status,
    b.guest_notes,
    b.host_notes,
    b.created_at,
    b.updated_at,
    r.title as room_title,
    r.address as room_address,
    r.city as room_city,
    r.country as room_country,
    u.email as user_email,
    u.full_name as user_full_name,
    u.phone as user_phone
  FROM bookings b
  LEFT JOIN rooms r ON b.room_id = r.id
  LEFT JOIN users u ON b.user_id = u.id
  WHERE b.host_id = host_uuid
    AND b.check_in_date >= start_date
    AND b.check_out_date <= end_date
  ORDER BY b.check_in_date ASC;
END;
$$;

-- 4. Function để lấy host booking stats
CREATE OR REPLACE FUNCTION get_host_booking_stats(host_uuid UUID)
RETURNS TABLE (
  total_bookings BIGINT,
  pending_bookings BIGINT,
  confirmed_bookings BIGINT,
  in_progress_bookings BIGINT,
  completed_bookings BIGINT,
  cancelled_bookings BIGINT,
  no_show_bookings BIGINT,
  refunded_bookings BIGINT,
  disputed_bookings BIGINT,
  total_revenue DECIMAL
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_bookings,
    COUNT(*) FILTER (WHERE status = 'pending') as pending_bookings,
    COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed_bookings,
    COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress_bookings,
    COUNT(*) FILTER (WHERE status = 'completed') as completed_bookings,
    COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_bookings,
    COUNT(*) FILTER (WHERE status = 'no_show') as no_show_bookings,
    COUNT(*) FILTER (WHERE status = 'refunded') as refunded_bookings,
    COUNT(*) FILTER (WHERE status = 'disputed') as disputed_bookings,
    COALESCE(SUM(total_amount) FILTER (WHERE status IN ('confirmed', 'in_progress', 'completed')), 0) as total_revenue
  FROM bookings
  WHERE host_id = host_uuid;
END;
$$;

-- 5. Function để lấy room availability calendar
CREATE OR REPLACE FUNCTION get_room_availability_calendar(
  room_uuid UUID,
  host_uuid UUID,
  start_date DATE,
  end_date DATE
)
RETURNS TABLE (
  date DATE,
  is_available BOOLEAN,
  booking_id UUID,
  booking_status TEXT,
  guest_count INTEGER,
  user_full_name TEXT,
  user_email TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_date DATE;
BEGIN
  -- Kiểm tra room có thuộc host không
  IF NOT EXISTS (
    SELECT 1 FROM rooms 
    WHERE id = room_uuid AND host_id = host_uuid
  ) THEN
    RAISE EXCEPTION 'Access denied: Room does not belong to this host';
  END IF;

  -- Tạo calendar dates
  current_date := start_date;
  WHILE current_date <= end_date LOOP
    RETURN QUERY
    SELECT 
      current_date as date,
      CASE 
        WHEN EXISTS (
          SELECT 1 FROM bookings 
          WHERE room_id = room_uuid 
            AND check_in_date <= current_date 
            AND check_out_date > current_date
            AND status IN ('pending', 'confirmed', 'in_progress', 'completed')
        ) THEN FALSE
        ELSE TRUE
      END as is_available,
      b.id as booking_id,
      b.status as booking_status,
      b.guest_count,
      u.full_name as user_full_name,
      u.email as user_email
    FROM (SELECT current_date) as cd
    LEFT JOIN bookings b ON b.room_id = room_uuid 
      AND b.check_in_date <= current_date 
      AND b.check_out_date > current_date
      AND b.status IN ('pending', 'confirmed', 'in_progress', 'completed')
    LEFT JOIN users u ON b.user_id = u.id;
    
    current_date := current_date + INTERVAL '1 day';
  END LOOP;
END;
$$;

-- 6. Function để lấy tất cả rooms availability của host
CREATE OR REPLACE FUNCTION get_host_rooms_availability(
  host_uuid UUID,
  start_date DATE,
  end_date DATE
)
RETURNS TABLE (
  room_id UUID,
  room_title TEXT,
  room_address TEXT,
  date DATE,
  is_available BOOLEAN,
  booking_id UUID,
  booking_status TEXT,
  guest_count INTEGER,
  user_full_name TEXT,
  user_email TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  room_record RECORD;
  current_date DATE;
BEGIN
  -- Lặp qua tất cả rooms của host
  FOR room_record IN 
    SELECT id, title, address 
    FROM rooms 
    WHERE host_id = host_uuid
  LOOP
    -- Tạo calendar cho mỗi room
    current_date := start_date;
    WHILE current_date <= end_date LOOP
      RETURN QUERY
      SELECT 
        room_record.id as room_id,
        room_record.title as room_title,
        room_record.address as room_address,
        current_date as date,
        CASE 
          WHEN EXISTS (
            SELECT 1 FROM bookings 
            WHERE room_id = room_record.id 
              AND check_in_date <= current_date 
              AND check_out_date > current_date
              AND status IN ('pending', 'confirmed', 'in_progress', 'completed')
          ) THEN FALSE
          ELSE TRUE
        END as is_available,
        b.id as booking_id,
        b.status as booking_status,
        b.guest_count,
        u.full_name as user_full_name,
        u.email as user_email
      FROM (SELECT current_date) as cd
      LEFT JOIN bookings b ON b.room_id = room_record.id 
        AND b.check_in_date <= current_date 
        AND b.check_out_date > current_date
        AND b.status IN ('pending', 'confirmed', 'in_progress', 'completed')
      LEFT JOIN users u ON b.user_id = u.id;
      
      current_date := current_date + INTERVAL '1 day';
    END LOOP;
  END LOOP;
END;
$$;

-- 7. Function để check room availability nhanh
CREATE OR REPLACE FUNCTION check_room_availability(
  room_uuid UUID,
  check_in_date DATE,
  check_out_date DATE
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM bookings 
    WHERE room_id = room_uuid 
      AND check_in_date < check_out_date
      AND check_out_date > check_in_date
      AND status IN ('pending', 'confirmed', 'in_progress', 'completed')
  );
END;
$$;

-- 8. Function để lấy user bookings
CREATE OR REPLACE FUNCTION get_user_bookings(user_uuid UUID)
RETURNS TABLE (
  id UUID,
  room_id UUID,
  user_id UUID,
  host_id UUID,
  check_in_date DATE,
  check_out_date DATE,
  guest_count INTEGER,
  total_amount DECIMAL,
  status TEXT,
  guest_notes TEXT,
  host_notes TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  room_title TEXT,
  room_address TEXT,
  room_city TEXT,
  room_country TEXT,
  host_full_name TEXT,
  host_email TEXT,
  host_phone TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id,
    b.room_id,
    b.user_id,
    b.host_id,
    b.check_in_date,
    b.check_out_date,
    b.guest_count,
    b.total_amount,
    b.status,
    b.guest_notes,
    b.host_notes,
    b.created_at,
    b.updated_at,
    r.title as room_title,
    r.address as room_address,
    r.city as room_city,
    r.country as room_country,
    h.full_name as host_full_name,
    h.email as host_email,
    h.phone as host_phone
  FROM bookings b
  LEFT JOIN rooms r ON b.room_id = r.id
  LEFT JOIN users h ON b.host_id = h.id
  WHERE b.user_id = user_uuid
  ORDER BY b.created_at DESC;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_host_bookings(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_room_bookings(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_host_bookings_by_date_range(UUID, DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION get_host_booking_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_room_availability_calendar(UUID, UUID, DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION get_host_rooms_availability(UUID, DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION check_room_availability(UUID, DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_bookings(UUID) TO authenticated;
