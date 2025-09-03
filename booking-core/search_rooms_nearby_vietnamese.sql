-- Function để normalize text (bỏ dấu, lowercase)
CREATE OR REPLACE FUNCTION normalize_vietnamese_text(input_text TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
  -- Chuyển về lowercase và bỏ dấu
  RETURN lower(
    translate(
      input_text,
      'àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ',
      'aaaaaaaaaaaaaaaaaeeeeeeeeeeiiiiioooooooooooooouuuuuuuuuuyyyyyd'
    )
  );
END;
$$;

-- RPC Function search rooms nearby với xử lý tiếng Việt
CREATE OR REPLACE FUNCTION search_rooms_nearby(
  lat_param NUMERIC,
  lng_param NUMERIC,
  check_in_date_param DATE DEFAULT NULL,
  check_out_date_param DATE DEFAULT NULL,
  radius_km_param INTEGER DEFAULT 10,
  max_guests_param INTEGER DEFAULT NULL,
  min_price_param NUMERIC(10,2) DEFAULT NULL,
  max_price_param NUMERIC(10,2) DEFAULT NULL,
  search_term TEXT DEFAULT NULL  -- Thêm parameter search term
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  normalized_search TEXT;
BEGIN
  -- Normalize search term nếu có
  IF search_term IS NOT NULL THEN
    normalized_search := normalize_vietnamese_text(search_term);
  END IF;

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
      'distance_km', calculate_distance_km(lat_param, lng_param, r.latitude, r.longitude),
      'search_score', 
        CASE 
          WHEN search_term IS NULL THEN 0
          WHEN lower(r.city) = lower(search_term) THEN 100
          WHEN lower(r.location) = lower(search_term) THEN 90
          WHEN lower(r.address) = lower(search_term) THEN 80
          WHEN lower(r.city) LIKE '%' || lower(search_term) || '%' THEN 70
          WHEN lower(r.location) LIKE '%' || lower(search_term) || '%' THEN 60
          WHEN lower(r.address) LIKE '%' || lower(search_term) || '%' THEN 50
          WHEN normalize_vietnamese_text(r.city) LIKE '%' || normalized_search || '%' THEN 40
          WHEN normalize_vietnamese_text(r.location) LIKE '%' || normalized_search || '%' THEN 30
          WHEN normalize_vietnamese_text(r.address) LIKE '%' || normalized_search || '%' THEN 20
          ELSE 0
        END
    )
    ORDER BY 
      CASE 
        WHEN search_term IS NULL THEN calculate_distance_km(lat_param, lng_param, r.latitude, r.longitude)
        ELSE 
          CASE 
            WHEN lower(r.city) = lower(search_term) THEN 100
            WHEN lower(r.location) = lower(search_term) THEN 90
            WHEN lower(r.address) = lower(search_term) THEN 80
            WHEN lower(r.city) LIKE '%' || lower(search_term) || '%' THEN 70
            WHEN lower(r.location) LIKE '%' || lower(search_term) || '%' THEN 60
            WHEN lower(r.address) LIKE '%' || lower(search_term) || '%' THEN 50
            WHEN normalize_vietnamese_text(r.city) LIKE '%' || normalized_search || '%' THEN 40
            WHEN normalize_vietnamese_text(r.location) LIKE '%' || normalized_search || '%' THEN 30
            WHEN normalize_vietnamese_text(r.address) LIKE '%' || normalized_search || '%' THEN 20
            ELSE 0
          END
      END DESC,
      calculate_distance_km(lat_param, lng_param, r.latitude, r.longitude) ASC
  ) INTO result
  FROM rooms r
  WHERE 
    r.is_available = true
    AND r.latitude IS NOT NULL 
    AND r.longitude IS NOT NULL
    -- Filter theo khoảng cách (sử dụng Haversine)
    AND calculate_distance_km(lat_param, lng_param, r.latitude, r.longitude) <= radius_km_param
    -- Filter theo search term (nếu có)
    AND (
      search_term IS NULL OR
      -- Exact match (case insensitive) - cả có dấu và không dấu
      lower(r.city) = lower(search_term) OR
      lower(r.location) = lower(search_term) OR
      lower(r.address) = lower(search_term) OR
      
      -- Partial match (case insensitive) - cả có dấu và không dấu
      lower(r.city) LIKE '%' || lower(search_term) || '%' OR
      lower(r.location) LIKE '%' || lower(search_term) || '%' OR
      lower(r.address) LIKE '%' || lower(search_term) || '%' OR
      
      -- Normalized match (bỏ dấu) - search term → normalized
      normalize_vietnamese_text(r.city) LIKE '%' || normalized_search || '%' OR
      normalize_vietnamese_text(r.location) LIKE '%' || normalized_search || '%' OR
      normalize_vietnamese_text(r.address) LIKE '%' || normalized_search || '%' OR
      
      -- Reverse normalized match (có dấu) - search term có dấu → tìm trong normalized data
      normalize_vietnamese_text(r.city) LIKE '%' || normalize_vietnamese_text(search_term) || '%' OR
      normalize_vietnamese_text(r.location) LIKE '%' || normalize_vietnamese_text(search_term) || '%' OR
      normalize_vietnamese_text(r.address) LIKE '%' || normalize_vietnamese_text(search_term) || '%'
    )
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
GRANT EXECUTE ON FUNCTION normalize_vietnamese_text(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION search_rooms_nearby(NUMERIC, NUMERIC, DATE, DATE, INTEGER, INTEGER, NUMERIC, NUMERIC, TEXT) TO authenticated;

-- Test function
SELECT * FROM search_rooms_nearby(
  lat_param := 10.762622,
  lng_param := 106.660172,
  search_term := 'da lat'
);

SELECT * FROM search_rooms_nearby(
  lat_param := 10.762622,
  lng_param := 106.660172,
  search_term := 'Đà Lạt'
);

SELECT * FROM search_rooms_nearby(
  lat_param := 10.762622,
  lng_param := 106.660172,
  search_term := 'dalat'
);
