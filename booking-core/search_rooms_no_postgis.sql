-- RPC Function search rooms KHÔNG sử dụng PostGIS
-- Sử dụng công thức Haversine để tính khoảng cách
-- Hoạt động với PostgreSQL thông thường

-- Function tính khoảng cách giữa 2 điểm (km) - Haversine formula
CREATE OR REPLACE FUNCTION calculate_distance_km(
  lat1 NUMERIC,
  lng1 NUMERIC,
  lat2 NUMERIC,
  lng2 NUMERIC
)
RETURNS NUMERIC
LANGUAGE plpgsql
AS $$
DECLARE
  R NUMERIC := 6371; -- Bán kính Trái Đất (km)
  dlat NUMERIC;
  dlng NUMERIC;
  a NUMERIC;
  c NUMERIC;
BEGIN
  -- Chuyển đổi sang radians
  dlat := radians(lat2 - lat1);
  dlng := radians(lng2 - lng1);
  
  -- Công thức Haversine
  a := sin(dlat/2) * sin(dlat/2) + 
       cos(radians(lat1)) * cos(radians(lat2)) * 
       sin(dlng/2) * sin(dlng/2);
  c := 2 * atan2(sqrt(a), sqrt(1-a));
  
  RETURN R * c;
END;
$$;

-- RPC Function search rooms (KHÔNG cần PostGIS)
CREATE OR REPLACE FUNCTION search_rooms_nearby(
  lat_param NUMERIC,
  lng_param NUMERIC,
  check_in_date_param DATE DEFAULT NULL,
  check_out_date_param DATE DEFAULT NULL,
  radius_km_param INTEGER DEFAULT 10,
  max_guests_param INTEGER DEFAULT NULL,
  min_price_param NUMERIC(10,2) DEFAULT NULL,
  max_price_param NUMERIC(10,2) DEFAULT NULL
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
      'distance_km', calculate_distance_km(lat_param, lng_param, r.latitude, r.longitude)
    )
    ORDER BY calculate_distance_km(lat_param, lng_param, r.latitude, r.longitude) ASC
  ) INTO result
  FROM rooms r
  WHERE 
    r.is_available = true
    AND r.latitude IS NOT NULL 
    AND r.longitude IS NOT NULL
    -- Filter theo khoảng cách (sử dụng Haversine)
    AND calculate_distance_km(lat_param, lng_param, r.latitude, r.longitude) <= radius_km_param
    -- Filter theo số khách (optional)
    AND (max_guests_param IS NULL OR r.max_guests >= max_guests_param)
    -- Filter theo giá
    AND (min_price_param IS NULL OR r.price_per_night >= min_price_param)
    AND (max_price_param IS NULL OR r.price_per_night <= max_price_param)
    -- Filter theo availability (chỉ khi có check_in_date và check_out_date)
    AND (
      check_in_date_param IS NULL 
      OR check_out_date_param IS NULL
      OR NOT EXISTS (
        SELECT 1 FROM bookings b
        WHERE b.room_id = r.id
          AND b.check_in_date < check_out_date_param
          AND b.check_out_date > check_in_date_param
          AND b.status IN ('pending', 'confirmed', 'in_progress', 'completed')
      )
    );
  
  RETURN COALESCE(result, '[]'::json);
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION calculate_distance_km(NUMERIC, NUMERIC, NUMERIC, NUMERIC) TO authenticated;
GRANT EXECUTE ON FUNCTION search_rooms_nearby(NUMERIC, NUMERIC, DATE, DATE, INTEGER, INTEGER, NUMERIC, NUMERIC) TO authenticated;

-- Test function
SELECT * FROM search_rooms_nearby(
  lat := 10.762622,
  lng := 106.660172,
  radius_km := 10
);
