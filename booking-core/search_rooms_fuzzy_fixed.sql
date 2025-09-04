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

-- Function để tính similarity giữa 2 strings
CREATE OR REPLACE FUNCTION calculate_string_similarity(str1 TEXT, str2 TEXT)
RETURNS NUMERIC
LANGUAGE plpgsql
AS $$
DECLARE
  normalized1 TEXT;
  normalized2 TEXT;
  similarity NUMERIC;
BEGIN
  -- Normalize cả 2 strings
  normalized1 := normalize_vietnamese_text(str1);
  normalized2 := normalize_vietnamese_text(str2);
  
  -- Tính similarity dựa trên:
  -- 1. Exact match: 100%
  -- 2. Contains: 80%
  -- 3. Similar words: 60%
  -- 4. Partial match: 40%
  
  IF normalized1 = normalized2 THEN
    similarity := 100;
  ELSIF normalized1 LIKE '%' || normalized2 || '%' OR normalized2 LIKE '%' || normalized1 || '%' THEN
    similarity := 80;
  ELSIF normalized1 LIKE '%' || substring(normalized2, 1, 3) || '%' OR 
        normalized2 LIKE '%' || substring(normalized1, 1, 3) || '%' THEN
    similarity := 60;
  ELSIF normalized1 LIKE '%' || substring(normalized2, 1, 2) || '%' OR 
        normalized2 LIKE '%' || substring(normalized1, 1, 2) || '%' THEN
    similarity := 40;
  ELSE
    similarity := 0;
  END IF;
  
  RETURN similarity;
END;
$$;

-- Function để tính search score
CREATE OR REPLACE FUNCTION calculate_search_score(
  city TEXT, 
  location TEXT, 
  address TEXT, 
  title TEXT, 
  description TEXT, 
  search_term TEXT, 
  normalized_search TEXT, 
  normalized_search_no_space TEXT
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  score INTEGER := 0;
BEGIN
  IF search_term IS NULL THEN
    RETURN 0;
  END IF;

  -- Exact matches (100-90)
  IF lower(city) = lower(search_term) THEN
    score := 100;
  ELSIF lower(location) = lower(search_term) THEN
    score := 95;
  ELSIF lower(address) = lower(search_term) THEN
    score := 90;
  ELSIF lower(title) = lower(search_term) THEN
    score := 88;
  ELSIF lower(description) = lower(search_term) THEN
    score := 85;
  
  -- Normalized exact matches (85-80)
  ELSIF normalize_vietnamese_text(city) = normalized_search THEN
    score := 85;
  ELSIF normalize_vietnamese_text(location) = normalized_search THEN
    score := 82;
  ELSIF normalize_vietnamese_text(address) = normalized_search THEN
    score := 80;
  
  -- Contains matches (75-65)
  ELSIF lower(city) LIKE '%' || lower(search_term) || '%' THEN
    score := 75;
  ELSIF lower(location) LIKE '%' || lower(search_term) || '%' THEN
    score := 70;
  ELSIF lower(address) LIKE '%' || lower(search_term) || '%' THEN
    score := 65;
  ELSIF lower(title) LIKE '%' || lower(search_term) || '%' THEN
    score := 60;
  ELSIF lower(description) LIKE '%' || lower(search_term) || '%' THEN
    score := 55;
  
  -- Normalized contains (50-40)
  ELSIF normalize_vietnamese_text(city) LIKE '%' || normalized_search || '%' THEN
    score := 50;
  ELSIF normalize_vietnamese_text(location) LIKE '%' || normalized_search || '%' THEN
    score := 45;
  ELSIF normalize_vietnamese_text(address) LIKE '%' || normalized_search || '%' THEN
    score := 40;
  
  -- Fuzzy matches (35-20)
  ELSIF calculate_string_similarity(city, search_term) >= 60 THEN
    score := 35;
  ELSIF calculate_string_similarity(location, search_term) >= 60 THEN
    score := 30;
  ELSIF calculate_string_similarity(address, search_term) >= 60 THEN
    score := 25;
  ELSIF calculate_string_similarity(title, search_term) >= 60 THEN
    score := 20;
  
  -- No-space matches (15-10)
  ELSIF replace(normalize_vietnamese_text(city), ' ', '') LIKE '%' || normalized_search_no_space || '%' THEN
    score := 15;
  ELSIF replace(normalize_vietnamese_text(location), ' ', '') LIKE '%' || normalized_search_no_space || '%' THEN
    score := 12;
  ELSIF replace(normalize_vietnamese_text(address), ' ', '') LIKE '%' || normalized_search_no_space || '%' THEN
    score := 10;
  
  -- Very fuzzy matches (8-5)
  ELSIF calculate_string_similarity(city, search_term) >= 40 THEN
    score := 8;
  ELSIF calculate_string_similarity(location, search_term) >= 40 THEN
    score := 6;
  ELSIF calculate_string_similarity(address, search_term) >= 40 THEN
    score := 5;
  END IF;
  
  RETURN score;
END;
$$;

-- RPC Function search rooms - Fuzzy search với xử lý lỗi chính tả
CREATE OR REPLACE FUNCTION search_rooms_nearby(
  lat_param NUMERIC DEFAULT NULL,
  lng_param NUMERIC DEFAULT NULL,
  check_in_date_param DATE DEFAULT NULL,
  check_out_date_param DATE DEFAULT NULL,
  radius_km_param INTEGER DEFAULT 100,
  max_guests_param INTEGER DEFAULT NULL,
  min_price_param NUMERIC(10,2) DEFAULT NULL,
  max_price_param NUMERIC(10,2) DEFAULT NULL,
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
      'search_score', calculate_search_score(
        r.city, r.location, r.address, r.title, r.description,
        search_term, normalized_search, normalized_search_no_space
      )
    )
    ORDER BY
      calculate_search_score(
        r.city, r.location, r.address, r.title, r.description,
        search_term, normalized_search, normalized_search_no_space
      ) DESC,
      CASE 
        WHEN lat_param IS NOT NULL AND lng_param IS NOT NULL AND r.latitude IS NOT NULL AND r.longitude IS NOT NULL 
        THEN calculate_distance_km(lat_param, lng_param, r.latitude, r.longitude)
        ELSE 999999
      END ASC,
      r.created_at DESC
  ) INTO result
  FROM rooms r
  WHERE 
    r.is_available = true
    -- Filter theo search term (nếu có) - Loose matching
    AND (
      search_term IS NULL OR
      -- Exact matches
      lower(r.city) = lower(search_term) OR
      lower(r.location) = lower(search_term) OR
      lower(r.address) = lower(search_term) OR
      lower(r.title) = lower(search_term) OR
      lower(r.description) = lower(search_term) OR
      
      -- Contains matches
      lower(r.city) LIKE '%' || lower(search_term) || '%' OR
      lower(r.location) LIKE '%' || lower(search_term) || '%' OR
      lower(r.address) LIKE '%' || lower(search_term) || '%' OR
      lower(r.title) LIKE '%' || lower(search_term) || '%' OR
      lower(r.description) LIKE '%' || lower(search_term) || '%' OR
      
      -- Normalized matches
      normalize_vietnamese_text(r.city) LIKE '%' || normalized_search || '%' OR
      normalize_vietnamese_text(r.location) LIKE '%' || normalized_search || '%' OR
      normalize_vietnamese_text(r.address) LIKE '%' || normalized_search || '%' OR
      normalize_vietnamese_text(r.title) LIKE '%' || normalized_search || '%' OR
      normalize_vietnamese_text(r.description) LIKE '%' || normalized_search || '%' OR
      
      -- No-space matches
      replace(normalize_vietnamese_text(r.city), ' ', '') LIKE '%' || normalized_search_no_space || '%' OR
      replace(normalize_vietnamese_text(r.location), ' ', '') LIKE '%' || normalized_search_no_space || '%' OR
      replace(normalize_vietnamese_text(r.address), ' ', '') LIKE '%' || normalized_search_no_space || '%' OR
      
      -- Fuzzy matches (tolerance cao hơn)
      calculate_string_similarity(r.city, search_term) >= 40 OR
      calculate_string_similarity(r.location, search_term) >= 40 OR
      calculate_string_similarity(r.address, search_term) >= 40 OR
      calculate_string_similarity(r.title, search_term) >= 40
    )
    -- Filter theo khoảng cách
    AND (
      lat_param IS NULL OR 
      lng_param IS NULL OR 
      r.latitude IS NULL OR 
      r.longitude IS NULL OR
      calculate_distance_km(lat_param, lng_param, r.latitude, r.longitude) <= radius_km_param
    )
    -- Filter theo số khách
    AND (max_guests_param IS NULL OR r.max_guests >= max_guests_param)
    -- Filter theo giá
    AND (min_price_param IS NULL OR r.price_per_night >= min_price_param)
    AND (max_price_param IS NULL OR r.price_per_night <= max_price_param)
    -- Filter theo availability
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
GRANT EXECUTE ON FUNCTION calculate_string_similarity(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_search_score(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION search_rooms_nearby(NUMERIC, NUMERIC, DATE, DATE, INTEGER, INTEGER, NUMERIC, NUMERIC, TEXT) TO authenticated;

-- Test function - Fuzzy search với lỗi chính tả
SELECT * FROM search_rooms_nearby(
  search_term := 'vũng tài'  -- Sai chính tả, nhưng vẫn ra "vũng tàu"
);

SELECT * FROM search_rooms_nearby(
  search_term := 'da lat'    -- Không dấu, vẫn ra "Đà Lạt"
);

SELECT * FROM search_rooms_nearby(
  search_term := 'ho chi min'  -- Thiếu chữ, vẫn ra "Hồ Chí Minh"
);

SELECT * FROM search_rooms_nearby(
  search_term := 'vung tau'   -- Không dấu, vẫn ra "Vũng Tàu"
);

-- Test function - Search chính xác
SELECT * FROM search_rooms_nearby(
  search_term := 'Vũng Tàu'
);

SELECT * FROM search_rooms_nearby(
  search_term := 'Đà Lạt'
);

SELECT * FROM search_rooms_nearby(
  search_term := 'Hồ Chí Minh'
);
