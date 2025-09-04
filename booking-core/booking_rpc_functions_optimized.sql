-- RPC Functions tối ưu cho Booking APIs
-- Sử dụng JSON return thay vì TABLE để linh hoạt hơn

-- Enable PostGIS extension (cần thiết cho geospatial functions)
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Function để lấy host bookings với room và user info
CREATE OR REPLACE FUNCTION get_host_bookings(host_uuid UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_agg(
    json_build_object(
      'id', b.id,
      'room_id', b.room_id,
      'user_id', b.user_id,
      'host_id', b.host_id,
      'check_in_date', b.check_in_date,
      'check_out_date', b.check_out_date,
      'guest_count', b.guest_count,
      'total_amount', b.total_amount,
      'status', b.status,
      'guest_notes', b.guest_notes,
      'host_notes', b.host_notes,
      'created_at', b.created_at,
      'updated_at', b.updated_at,
      'rooms', json_build_object(
        'id', r.id,
        'title', r.title,
        'address', r.address,
        'city', r.city,
        'country', r.country
      ),
      'users', json_build_object(
        'id', u.id,
        'email', u.email,
        'full_name', u.full_name,
        'phone', u.phone
      )
    )
  ) INTO result
  FROM bookings b
  LEFT JOIN rooms r ON b.room_id = r.id
  LEFT JOIN users u ON b.user_id = u.id
  WHERE b.host_id = host_uuid
  ORDER BY b.created_at DESC;
  
  RETURN COALESCE(result, '[]'::json);
END;
$$;

-- 2. Function để lấy room bookings với user info
CREATE OR REPLACE FUNCTION get_room_bookings(room_uuid UUID, host_uuid UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  -- Kiểm tra room có thuộc host không
  IF NOT EXISTS (
    SELECT 1 FROM rooms 
    WHERE id = room_uuid AND host_id = host_uuid
  ) THEN
    RAISE EXCEPTION 'Access denied: Room does not belong to this host';
  END IF;

  SELECT json_agg(
    json_build_object(
      'id', b.id,
      'room_id', b.room_id,
      'user_id', b.user_id,
      'host_id', b.host_id,
      'check_in_date', b.check_in_date,
      'check_out_date', b.check_out_date,
      'guest_count', b.guest_count,
      'total_amount', b.total_amount,
      'status', b.status,
      'guest_notes', b.guest_notes,
      'host_notes', b.host_notes,
      'created_at', b.created_at,
      'updated_at', b.updated_at,
      'users', json_build_object(
        'id', u.id,
        'email', u.email,
        'full_name', u.full_name,
        'phone', u.phone
      )
    )
  ) INTO result
  FROM bookings b
  LEFT JOIN users u ON b.user_id = u.id
  WHERE b.room_id = room_uuid
  ORDER BY b.check_in_date ASC;
  
  RETURN COALESCE(result, '[]'::json);
END;
$$;

-- 3. Function để lấy host bookings theo date range
CREATE OR REPLACE FUNCTION get_host_bookings_by_date_range(
  host_uuid UUID,
  start_date DATE,
  end_date DATE
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_agg(
    json_build_object(
      'id', b.id,
      'room_id', b.room_id,
      'user_id', b.user_id,
      'host_id', b.host_id,
      'check_in_date', b.check_in_date,
      'check_out_date', b.check_out_date,
      'guest_count', b.guest_count,
      'total_amount', b.total_amount,
      'status', b.status,
      'guest_notes', b.guest_notes,
      'host_notes', b.host_notes,
      'created_at', b.created_at,
      'updated_at', b.updated_at,
      'rooms', json_build_object(
        'id', r.id,
        'title', r.title,
        'address', r.address,
        'city', r.city,
        'country', r.country
      ),
      'users', json_build_object(
        'id', u.id,
        'email', u.email,
        'full_name', u.full_name,
        'phone', u.phone
      )
    )
  ) INTO result
  FROM bookings b
  LEFT JOIN rooms r ON b.room_id = r.id
  LEFT JOIN users u ON b.user_id = u.id
  WHERE b.host_id = host_uuid
    AND b.check_in_date >= start_date
    AND b.check_out_date <= end_date
  ORDER BY b.check_in_date ASC;
  
  RETURN COALESCE(result, '[]'::json);
END;
$$;

-- 4. Function để lấy host booking stats
CREATE OR REPLACE FUNCTION get_host_booking_stats(host_uuid UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_bookings', COUNT(*),
    'status_counts', json_build_object(
      'pending', COUNT(*) FILTER (WHERE status = 'pending'),
      'confirmed', COUNT(*) FILTER (WHERE status = 'confirmed'),
      'in_progress', COUNT(*) FILTER (WHERE status = 'in_progress'),
      'completed', COUNT(*) FILTER (WHERE status = 'completed'),
      'cancelled', COUNT(*) FILTER (WHERE status = 'cancelled'),
      'no_show', COUNT(*) FILTER (WHERE status = 'no_show'),
      'refunded', COUNT(*) FILTER (WHERE status = 'refunded'),
      'disputed', COUNT(*) FILTER (WHERE status = 'disputed')
    ),
    'total_revenue', COALESCE(SUM(total_amount) FILTER (WHERE status IN ('confirmed', 'in_progress', 'completed')), 0),
    'completed_bookings', COUNT(*) FILTER (WHERE status = 'completed'),
    'pending_bookings', COUNT(*) FILTER (WHERE status = 'pending'),
    'cancelled_bookings', COUNT(*) FILTER (WHERE status = 'cancelled')
  ) INTO result
  FROM bookings
  WHERE host_id = host_uuid;
  
  RETURN result;
END;
$$;

-- 5. Function để check room availability nhanh
CREATE OR REPLACE FUNCTION check_room_availability_api(
  room_uuid UUID,
  check_in_date_param DATE,
  check_out_date_param DATE
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  is_available BOOLEAN;
BEGIN
  SELECT NOT EXISTS (
    SELECT 1 FROM bookings 
    WHERE room_id = room_uuid 
      AND check_in_date < check_out_date_param
      AND check_out_date > check_in_date_param
      AND status IN ('pending', 'confirmed', 'in_progress', 'completed')
  ) INTO is_available;
  
  RETURN json_build_object(
    'room_id', room_uuid,
    'check_in_date', check_in_date_param,
    'check_out_date', check_out_date_param,
    'is_available', is_available
  );
END;
$$;

-- 6. Function để lấy user bookings
CREATE OR REPLACE FUNCTION get_user_bookings(user_uuid UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_agg(
    json_build_object(
      'id', b.id,
      'room_id', b.room_id,
      'user_id', b.user_id,
      'host_id', b.host_id,
      'check_in_date', b.check_in_date,
      'check_out_date', b.check_out_date,
      'guest_count', b.guest_count,
      'total_amount', b.total_amount,
      'status', b.status,
      'guest_notes', b.guest_notes,
      'host_notes', b.host_notes,
      'created_at', b.created_at,
      'updated_at', b.updated_at,
      'rooms', json_build_object(
        'id', r.id,
        'title', r.title,
        'address', r.address,
        'city', r.city,
        'country', r.country
      ),
      'hosts', json_build_object(
        'id', h.id,
        'email', h.email,
        'full_name', h.full_name,
        'phone', h.phone
      )
    )
  ) INTO result
  FROM bookings b
  LEFT JOIN rooms r ON b.room_id = r.id
  LEFT JOIN users h ON b.host_id = h.id
  WHERE b.user_id = user_uuid
  ORDER BY b.created_at DESC;
  
  RETURN COALESCE(result, '[]'::json);
END;
$$;

-- 7. Function để lấy room availability calendar (dùng generate_series)
CREATE OR REPLACE FUNCTION get_room_availability_calendar(
  room_uuid UUID,
  host_uuid UUID,
  start_date DATE,
  end_date DATE
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  -- Kiểm tra room có thuộc host không
  IF NOT EXISTS (
    SELECT 1 FROM rooms 
    WHERE id = room_uuid AND host_id = host_uuid
  ) THEN
    RAISE EXCEPTION 'Access denied: Room does not belong to this host';
  END IF;

  -- Dùng generate_series thay vì WHILE loop
  SELECT json_build_object(
    'room_id', room_uuid,
    'start_date', start_date,
    'end_date', end_date,
    'availability', json_agg(
      json_build_object(
        'date', date_series.date_val,
        'is_available', NOT EXISTS (
          SELECT 1 FROM bookings 
          WHERE room_id = room_uuid 
            AND check_in_date <= date_series.date_val 
            AND check_out_date > date_series.date_val
            AND status IN ('pending', 'confirmed', 'in_progress', 'completed')
        )
      )
    )
  ) INTO result
  FROM (
    SELECT generate_series(start_date, end_date, '1 day'::interval)::date as date_val
  ) date_series;
  
  RETURN result;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_host_bookings(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_room_bookings(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_host_bookings_by_date_range(UUID, DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION get_host_booking_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION check_room_availability_api(UUID, DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_bookings(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_room_availability_calendar(UUID, UUID, DATE, DATE) TO authenticated;

-- 8. Function để search rooms nearby với availability check (JSON return)
CREATE OR REPLACE FUNCTION search_rooms_nearby(
  lat NUMERIC,
  lng NUMERIC,
  check_in_date DATE DEFAULT NULL,
  check_out_date DATE DEFAULT NULL,
  radius_km INTEGER DEFAULT 10,
  max_guests INTEGER DEFAULT NULL,
  min_price NUMERIC(10,2) DEFAULT NULL,
  max_price NUMERIC(10,2) DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_agg(
    json_build_object(
      'id', r.id,
      'title', r.title,
      'description', r.description,
      'price_per_night', r.price_per_night,
      'location', r.location,
      'address', r.address,
      'city', r.city,
      'country', r.country,
      'latitude', r.latitude,
      'longitude', r.longitude,
      'max_guests', r.max_guests,
      'bedrooms', r.bedrooms,
      'bathrooms', r.bathrooms,
      'beds', r.beds,
      'room_type_id', r.room_type_id,
      'amenities', r.amenities,
      'images', r.images,
      'host_id', r.host_id,
      'is_available', r.is_available,
      'created_at', r.created_at,
      'updated_at', r.updated_at,
      'distance_km', ST_Distance(
        ST_MakePoint(r.longitude::NUMERIC, r.latitude::NUMERIC)::geography,
        ST_MakePoint(lng::NUMERIC, lat::NUMERIC)::geography
      ) / 1000.0
    )
  ) INTO result
  FROM rooms r
  WHERE 
    r.is_available = true
    AND r.latitude IS NOT NULL 
    AND r.longitude IS NOT NULL
    -- Filter theo khoảng cách
    AND ST_DWithin(
      ST_MakePoint(r.longitude::NUMERIC, r.latitude::NUMERIC)::geography,
      ST_MakePoint(lng::NUMERIC, lat::NUMERIC)::geography,
      radius_km * 1000  -- Convert km to meters
    )
    -- Filter theo số khách (optional)
    AND (max_guests IS NULL OR r.max_guests >= max_guests)
    -- Filter theo giá
    AND (min_price IS NULL OR r.price_per_night >= min_price)
    AND (max_price IS NULL OR r.price_per_night <= max_price)
    -- Filter theo availability (chỉ khi có check_in_date và check_out_date)
    AND (
      check_in_date IS NULL 
      OR check_out_date IS NULL
      OR NOT EXISTS (
        SELECT 1 FROM bookings b
        WHERE b.room_id = r.id
          AND b.check_in_date < check_out_date
          AND b.check_out_date > check_in_date
          AND b.status IN ('pending', 'confirmed', 'in_progress', 'completed')
      )
    )
  ORDER BY ST_Distance(
    ST_MakePoint(r.longitude::NUMERIC, r.latitude::NUMERIC)::geography,
    ST_MakePoint(lng::NUMERIC, lat::NUMERIC)::geography
  ) ASC;
  
  RETURN COALESCE(result, '[]'::json);
END;
$$;

GRANT EXECUTE ON FUNCTION search_rooms_nearby(NUMERIC, NUMERIC, DATE, DATE, INTEGER, INTEGER, NUMERIC, NUMERIC) TO authenticated;
