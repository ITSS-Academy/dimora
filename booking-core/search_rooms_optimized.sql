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

-- RPC Function search rooms - Tối ưu với đầy đủ filters
CREATE OR REPLACE FUNCTION search_rooms_nearby(
  lat_param NUMERIC DEFAULT NULL,
  lng_param NUMERIC DEFAULT NULL,
  check_in_date_param DATE DEFAULT NULL,
  check_out_date_param DATE DEFAULT NULL,
  radius_km_param INTEGER DEFAULT 100,  -- Tăng default radius lên 100km để mở rộng phạm vi search
  max_guests_param INTEGER DEFAULT NULL,
  min_price_param NUMERIC(10,2) DEFAULT NULL,  -- Thêm min price filter
  max_price_param NUMERIC(10,2) DEFAULT NULL,  -- Thêm max price filter
  search_term TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  normalized_search TEXT;
  normalized_search_no_space TEXT;
BEGIN
  -- Normalize search term nếu có
  IF search_term IS NOT NULL THEN
    normalized_search := normalize_vietnamese_text(search_term);
    normalized_search_no_space := replace(normalized_search, ' ', '');
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
      'distance_km', 
        CASE 
          WHEN lat_param IS NOT NULL AND lng_param IS NOT NULL AND r.latitude IS NOT NULL AND r.longitude IS NOT NULL 
          THEN calculate_distance_km(lat_param, lng_param, r.latitude, r.longitude)
          ELSE NULL
        END,
      'search_score', 
        CASE 
          WHEN search_term IS NULL THEN 0
          WHEN lower(r.city) = lower(search_term) THEN 100
          WHEN lower(r.location) = lower(search_term) THEN 90
          WHEN lower(r.address) = lower(search_term) THEN 80
          WHEN lower(r.title) = lower(search_term) THEN 75
          WHEN lower(r.description) = lower(search_term) THEN 65
          WHEN lower(r.city) LIKE '%' || lower(search_term) || '%' THEN 70
          WHEN lower(r.location) LIKE '%' || lower(search_term) || '%' THEN 60
          WHEN lower(r.address) LIKE '%' || lower(search_term) || '%' THEN 50
          WHEN lower(r.title) LIKE '%' || lower(search_term) || '%' THEN 45
          WHEN lower(r.description) LIKE '%' || lower(search_term) || '%' THEN 35
          WHEN normalize_vietnamese_text(r.city) LIKE '%' || normalized_search || '%' THEN 40
          WHEN normalize_vietnamese_text(r.location) LIKE '%' || normalized_search || '%' THEN 30
          WHEN normalize_vietnamese_text(r.address) LIKE '%' || normalized_search || '%' THEN 20
          WHEN normalize_vietnamese_text(r.title) LIKE '%' || normalized_search || '%' THEN 18
          WHEN normalize_vietnamese_text(r.description) LIKE '%' || normalized_search || '%' THEN 16
          WHEN replace(normalize_vietnamese_text(r.city), ' ', '') LIKE '%' || normalized_search_no_space || '%' THEN 15
          WHEN replace(normalize_vietnamese_text(r.location), ' ', '') LIKE '%' || normalized_search_no_space || '%' THEN 12
          WHEN replace(normalize_vietnamese_text(r.address), ' ', '') LIKE '%' || normalized_search_no_space || '%' THEN 10
          WHEN replace(normalize_vietnamese_text(r.title), ' ', '') LIKE '%' || normalized_search_no_space || '%' THEN 9
          WHEN replace(normalize_vietnamese_text(r.description), ' ', '') LIKE '%' || normalized_search_no_space || '%' THEN 8
          ELSE 0
        END
    )
    ORDER BY
      CASE 
        WHEN search_term IS NOT NULL THEN
          CASE 
            WHEN lower(r.city) = lower(search_term) THEN 100
            WHEN lower(r.location) = lower(search_term) THEN 90
            WHEN lower(r.address) = lower(search_term) THEN 80
            WHEN lower(r.title) = lower(search_term) THEN 75
            WHEN lower(r.description) = lower(search_term) THEN 65
            WHEN lower(r.city) LIKE '%' || lower(search_term) || '%' THEN 70
            WHEN lower(r.location) LIKE '%' || lower(search_term) || '%' THEN 60
            WHEN lower(r.address) LIKE '%' || lower(search_term) || '%' THEN 50
            WHEN lower(r.title) LIKE '%' || lower(search_term) || '%' THEN 45
            WHEN lower(r.description) LIKE '%' || lower(search_term) || '%' THEN 35
            WHEN normalize_vietnamese_text(r.city) LIKE '%' || normalized_search || '%' THEN 40
            WHEN normalize_vietnamese_text(r.location) LIKE '%' || normalized_search || '%' THEN 30
            WHEN normalize_vietnamese_text(r.address) LIKE '%' || normalized_search || '%' THEN 20
            WHEN normalize_vietnamese_text(r.title) LIKE '%' || normalized_search || '%' THEN 18
            WHEN normalize_vietnamese_text(r.description) LIKE '%' || normalized_search || '%' THEN 16
            WHEN replace(normalize_vietnamese_text(r.city), ' ', '') LIKE '%' || normalized_search_no_space || '%' THEN 15
            WHEN replace(normalize_vietnamese_text(r.location), ' ', '') LIKE '%' || normalized_search_no_space || '%' THEN 12
            WHEN replace(normalize_vietnamese_text(r.address), ' ', '') LIKE '%' || normalized_search_no_space || '%' THEN 10
            WHEN replace(normalize_vietnamese_text(r.title), ' ', '') LIKE '%' || normalized_search_no_space || '%' THEN 9
            WHEN replace(normalize_vietnamese_text(r.description), ' ', '') LIKE '%' || normalized_search_no_space || '%' THEN 8
            ELSE 0
          END
        ELSE 0
      END DESC,
      CASE 
        WHEN lat_param IS NOT NULL AND lng_param IS NOT NULL AND r.latitude IS NOT NULL AND r.longitude IS NOT NULL 
        THEN calculate_distance_km(lat_param, lng_param, r.latitude, r.longitude)
        ELSE 999999  -- Treat missing coordinates as very far
      END ASC,
      r.created_at DESC
  ) INTO result
  FROM rooms r
  WHERE 
    r.is_available = true
    -- Filter theo search term (nếu có)
    AND (
      search_term IS NULL OR
      -- Exact match (case insensitive)
      lower(r.city) = lower(search_term) OR
      lower(r.location) = lower(search_term) OR
      lower(r.address) = lower(search_term) OR
      lower(r.title) = lower(search_term) OR
      lower(r.description) = lower(search_term) OR
      
      -- Partial match (case insensitive)
      lower(r.city) LIKE '%' || lower(search_term) || '%' OR
      lower(r.location) LIKE '%' || lower(search_term) || '%' OR
      lower(r.address) LIKE '%' || lower(search_term) || '%' OR
      lower(r.title) LIKE '%' || lower(search_term) || '%' OR
      lower(r.description) LIKE '%' || lower(search_term) || '%' OR
      
      -- Normalized match (bỏ dấu)
      normalize_vietnamese_text(r.city) LIKE '%' || normalized_search || '%' OR
      normalize_vietnamese_text(r.location) LIKE '%' || normalized_search || '%' OR
      normalize_vietnamese_text(r.address) LIKE '%' || normalized_search || '%' OR
      normalize_vietnamese_text(r.title) LIKE '%' || normalized_search || '%' OR
      normalize_vietnamese_text(r.description) LIKE '%' || normalized_search || '%' OR
      
      -- Normalized no-space match (bỏ dấu và khoảng trắng)
      replace(normalize_vietnamese_text(r.city), ' ', '') LIKE '%' || normalized_search_no_space || '%' OR
      replace(normalize_vietnamese_text(r.location), ' ', '') LIKE '%' || normalized_search_no_space || '%' OR
      replace(normalize_vietnamese_text(r.address), ' ', '') LIKE '%' || normalized_search_no_space || '%' OR
      replace(normalize_vietnamese_text(r.title), ' ', '') LIKE '%' || normalized_search_no_space || '%' OR
      replace(normalize_vietnamese_text(r.description), ' ', '') LIKE '%' || normalized_search_no_space || '%'
    )
    -- Filter theo khoảng cách (chỉ khi có coordinates)
    AND (
      lat_param IS NULL OR 
      lng_param IS NULL OR 
      r.latitude IS NULL OR 
      r.longitude IS NULL OR
      calculate_distance_km(lat_param, lng_param, r.latitude, r.longitude) <= radius_km_param
    )
    -- Filter theo số khách (optional)
    AND (max_guests_param IS NULL OR r.max_guests >= max_guests_param)
    -- Filter theo giá (thêm mới)
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

-- Test function - Search theo text
SELECT * FROM search_rooms_nearby(
  search_term := 'da lat'
);

SELECT * FROM search_rooms_nearby(
  search_term := 'Đà Lạt'
);

SELECT * FROM search_rooms_nearby(
  search_term := 'vung tau'
);

-- Test function - Search theo coordinates
SELECT * FROM search_rooms_nearby(
  lat_param := 10.762622,
  lng_param := 106.660172,
  radius_km_param := 10
);

-- Test function - Search với price filters
SELECT * FROM search_rooms_nearby(
  search_term := 'da lat',
  min_price_param := 300000,
  max_price_param := 800000
);

-- Test function - Search với guest filter
SELECT * FROM search_rooms_nearby(
  search_term := 'da lat',
  max_guests_param := 2
);

-- Test function - Search với date filter
SELECT * FROM search_rooms_nearby(
  search_term := 'da lat',
  check_in_date_param := '2025-01-15',
  check_out_date_param := '2025-01-20'
);

-- Test function - Kết hợp tất cả filters
SELECT * FROM search_rooms_nearby(
  lat_param := 10.762622,
  lng_param := 106.660172,
  search_term := 'da lat',
  check_in_date_param := '2025-01-15',
  check_out_date_param := '2025-01-20',
  radius_km_param := 10,
  max_guests_param := 2,
  min_price_param := 300000,
  max_price_param := 800000
);
