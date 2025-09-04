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
  search_term TEXT DEFAULT NULL,
  amenities_param INTEGER[] DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  normalized_search TEXT;
  normalized_search_no_space TEXT;
  search_words TEXT[];
  word_count INTEGER;
BEGIN
  IF search_term IS NOT NULL THEN
    normalized_search := normalize_vietnamese_text(search_term);
    normalized_search_no_space := replace(normalized_search, ' ', '');
    
    -- Tách search term thành các từ riêng biệt
    search_words := string_to_array(lower(search_term), ' ');
    word_count := array_length(search_words, 1);
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
      'amenities', (
        SELECT json_agg(
          json_build_object(
            'id', a.id,
            'name', a.name,
            'icon_name', a.icon_name
          )
        )
        FROM amenities a
        WHERE a.id::text = ANY(r.amenities)
      ),
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
          
          -- Perfect matches - Ưu tiên City và Location (100-95)
          WHEN lower(r.city) = lower(search_term) THEN 
            CASE 
              WHEN lat_param IS NOT NULL AND lng_param IS NOT NULL AND r.latitude IS NOT NULL AND r.longitude IS NOT NULL 
              THEN GREATEST(100 - (calculate_distance_km(lat_param, lng_param, r.latitude, r.longitude) / 8), 95)
              ELSE 100
            END
          WHEN lower(r.location) = lower(search_term) THEN 
            CASE 
              WHEN lat_param IS NOT NULL AND lng_param IS NOT NULL AND r.latitude IS NOT NULL AND r.longitude IS NOT NULL 
              THEN GREATEST(99 - (calculate_distance_km(lat_param, lng_param, r.latitude, r.longitude) / 8), 94)
              ELSE 99
            END
          
          -- Other perfect matches (90-85)
          WHEN lower(r.address) = lower(search_term) THEN 
            CASE 
              WHEN lat_param IS NOT NULL AND lng_param IS NOT NULL AND r.latitude IS NOT NULL AND r.longitude IS NOT NULL 
              THEN GREATEST(90 - (calculate_distance_km(lat_param, lng_param, r.latitude, r.longitude) / 15), 80)
              ELSE 90
            END
          WHEN lower(r.title) = lower(search_term) THEN 
            CASE 
              WHEN lat_param IS NOT NULL AND lng_param IS NOT NULL AND r.latitude IS NOT NULL AND r.longitude IS NOT NULL 
              THEN GREATEST(88 - (calculate_distance_km(lat_param, lng_param, r.latitude, r.longitude) / 15), 78)
              ELSE 88
            END
          WHEN lower(r.description) = lower(search_term) THEN 85
          
          -- Starts with matches - Ưu tiên City và Location (84-80)
          WHEN lower(r.city) LIKE lower(search_term) || '%' THEN 
            CASE 
              WHEN lat_param IS NOT NULL AND lng_param IS NOT NULL AND r.latitude IS NOT NULL AND r.longitude IS NOT NULL 
              THEN GREATEST(84 - (calculate_distance_km(lat_param, lng_param, r.latitude, r.longitude) / 15), 79)
              ELSE 84
            END
          WHEN lower(r.location) LIKE lower(search_term) || '%' THEN 
            CASE 
              WHEN lat_param IS NOT NULL AND lng_param IS NOT NULL AND r.latitude IS NOT NULL AND r.longitude IS NOT NULL 
              THEN GREATEST(83 - (calculate_distance_km(lat_param, lng_param, r.latitude, r.longitude) / 15), 78)
              ELSE 83
            END
          
          -- Other starts with matches (77-73)
          WHEN lower(r.address) LIKE lower(search_term) || '%' THEN 77
          WHEN lower(r.title) LIKE lower(search_term) || '%' THEN 75
          WHEN lower(r.description) LIKE lower(search_term) || '%' THEN 73
          
          -- Contains matches - Ưu tiên City và Location (72-67)
          WHEN lower(r.city) LIKE '%' || lower(search_term) || '%' THEN 
            CASE 
              WHEN lat_param IS NOT NULL AND lng_param IS NOT NULL AND r.latitude IS NOT NULL AND r.longitude IS NOT NULL 
              THEN GREATEST(72 - (calculate_distance_km(lat_param, lng_param, r.latitude, r.longitude) / 20), 67)
              ELSE 72
            END
          WHEN lower(r.location) LIKE '%' || lower(search_term) || '%' THEN 
            CASE 
              WHEN lat_param IS NOT NULL AND lng_param IS NOT NULL AND r.latitude IS NOT NULL AND r.longitude IS NOT NULL 
              THEN GREATEST(71 - (calculate_distance_km(lat_param, lng_param, r.latitude, r.longitude) / 20), 66)
              ELSE 71
            END
          
          -- Other contains matches (65-60)
          WHEN lower(r.address) LIKE '%' || lower(search_term) || '%' THEN 65
          WHEN lower(r.title) LIKE '%' || lower(search_term) || '%' THEN 63
          WHEN lower(r.description) LIKE '%' || lower(search_term) || '%' THEN 60
          
          -- Word-based matches (58-50) - Match từng từ riêng biệt
          WHEN word_count > 1 AND (
            lower(r.city) LIKE '%' || search_words[1] || '%' OR
            lower(r.location) LIKE '%' || search_words[1] || '%' OR
            lower(r.title) LIKE '%' || search_words[1] || '%' OR
            lower(r.address) LIKE '%' || search_words[1] || '%' OR
            lower(r.description) LIKE '%' || search_words[1] || '%'
          ) THEN 58
          
          WHEN word_count > 1 AND (
            lower(r.city) LIKE '%' || search_words[2] || '%' OR
            lower(r.location) LIKE '%' || search_words[2] || '%' OR
            lower(r.title) LIKE '%' || search_words[2] || '%' OR
            lower(r.address) LIKE '%' || search_words[2] || '%' OR
            lower(r.description) LIKE '%' || search_words[2] || '%'
          ) THEN 55
          
          WHEN word_count > 2 AND (
            lower(r.city) LIKE '%' || search_words[3] || '%' OR
            lower(r.location) LIKE '%' || search_words[3] || '%' OR
            lower(r.title) LIKE '%' || search_words[3] || '%' OR
            lower(r.address) LIKE '%' || search_words[3] || '%' OR
            lower(r.description) LIKE '%' || search_words[3] || '%'
          ) THEN 50
          
          -- Normalized matches - Ưu tiên City và Location (50-47)
          WHEN lower(normalize_vietnamese_text(r.city)) LIKE '%' || lower(normalized_search) || '%' THEN 50
          WHEN lower(normalize_vietnamese_text(r.location)) LIKE '%' || lower(normalized_search) || '%' THEN 49
          WHEN lower(normalize_vietnamese_text(r.address)) LIKE '%' || lower(normalized_search) || '%' THEN 48
          WHEN lower(normalize_vietnamese_text(r.title)) LIKE '%' || lower(normalized_search) || '%' THEN 47
          
          -- No-space matches - Ưu tiên City và Location (46-43)
          WHEN lower(replace(normalize_vietnamese_text(r.city), ' ', '')) LIKE '%' || lower(normalized_search_no_space) || '%' THEN 46
          WHEN lower(replace(normalize_vietnamese_text(r.location), ' ', '')) LIKE '%' || lower(normalized_search_no_space) || '%' THEN 45
          WHEN lower(replace(normalize_vietnamese_text(r.address), ' ', '')) LIKE '%' || lower(normalized_search_no_space) || '%' THEN 44
          WHEN lower(replace(normalize_vietnamese_text(r.title), ' ', '')) LIKE '%' || lower(normalized_search_no_space) || '%' THEN 43
          
          ELSE 0
        END
    )
    ORDER BY
      CASE 
        WHEN search_term IS NOT NULL THEN
          CASE 
            -- Perfect matches - Ưu tiên City và Location (100-95)
            WHEN lower(r.city) = lower(search_term) THEN 100
            WHEN lower(r.location) = lower(search_term) THEN 99
            WHEN lower(r.address) = lower(search_term) THEN 90
            WHEN lower(r.title) = lower(search_term) THEN 88
            WHEN lower(r.description) = lower(search_term) THEN 85
            
            -- Starts with - Ưu tiên City và Location (84-80)
            WHEN lower(r.city) LIKE lower(search_term) || '%' THEN 84
            WHEN lower(r.location) LIKE lower(search_term) || '%' THEN 83
            WHEN lower(r.address) LIKE lower(search_term) || '%' THEN 77
            WHEN lower(r.title) LIKE lower(search_term) || '%' THEN 75
            WHEN lower(r.description) LIKE lower(search_term) || '%' THEN 73
            
            -- Contains - Ưu tiên City và Location (72-67)
            WHEN lower(r.city) LIKE '%' || lower(search_term) || '%' THEN 72
            WHEN lower(r.location) LIKE '%' || lower(search_term) || '%' THEN 71
            WHEN lower(r.address) LIKE '%' || lower(search_term) || '%' THEN 65
            WHEN lower(r.title) LIKE '%' || lower(search_term) || '%' THEN 63
            WHEN lower(r.description) LIKE '%' || lower(search_term) || '%' THEN 60
            
            -- Word-based (58-50)
            WHEN word_count > 1 AND (
              lower(r.city) LIKE '%' || search_words[1] || '%' OR
              lower(r.location) LIKE '%' || search_words[1] || '%' OR
              lower(r.title) LIKE '%' || search_words[1] || '%' OR
              lower(r.address) LIKE '%' || search_words[1] || '%' OR
              lower(r.description) LIKE '%' || search_words[1] || '%'
            ) THEN 58
            
            WHEN word_count > 1 AND (
              lower(r.city) LIKE '%' || search_words[2] || '%' OR
              lower(r.location) LIKE '%' || search_words[2] || '%' OR
              lower(r.title) LIKE '%' || search_words[2] || '%' OR
              lower(r.address) LIKE '%' || search_words[2] || '%' OR
              lower(r.description) LIKE '%' || search_words[2] || '%'
            ) THEN 55
            
            WHEN word_count > 2 AND (
              lower(r.city) LIKE '%' || search_words[3] || '%' OR
              lower(r.location) LIKE '%' || search_words[3] || '%' OR
              lower(r.title) LIKE '%' || search_words[3] || '%' OR
              lower(r.address) LIKE '%' || search_words[3] || '%' OR
              lower(r.description) LIKE '%' || search_words[3] || '%'
            ) THEN 50
            
            -- Normalized - Ưu tiên City và Location (50-47)
            WHEN lower(normalize_vietnamese_text(r.city)) LIKE '%' || lower(normalized_search) || '%' THEN 50
            WHEN lower(normalize_vietnamese_text(r.location)) LIKE '%' || lower(normalized_search) || '%' THEN 49
            WHEN lower(normalize_vietnamese_text(r.address)) LIKE '%' || lower(normalized_search) || '%' THEN 48
            WHEN lower(normalize_vietnamese_text(r.title)) LIKE '%' || lower(normalized_search) || '%' THEN 47
            
            -- No-space - Ưu tiên City và Location (46-43)
            WHEN lower(replace(normalize_vietnamese_text(r.city), ' ', '')) LIKE '%' || lower(normalized_search_no_space) || '%' THEN 46
            WHEN lower(replace(normalize_vietnamese_text(r.location), ' ', '')) LIKE '%' || lower(normalized_search_no_space) || '%' THEN 45
            WHEN lower(replace(normalize_vietnamese_text(r.address), ' ', '')) LIKE '%' || lower(normalized_search_no_space) || '%' THEN 44
            WHEN lower(replace(normalize_vietnamese_text(r.title), ' ', '')) LIKE '%' || lower(normalized_search_no_space) || '%' THEN 43
            
            ELSE 0
          END
        ELSE 0
      END DESC,
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
    -- Filter theo search term (nếu có) - Lấy kết quả đa dạng hơn
    AND (
      search_term IS NULL OR
      
      -- Perfect matches
      lower(r.city) = lower(search_term) OR
      lower(r.location) = lower(search_term) OR
      lower(r.title) = lower(search_term) OR
      lower(r.address) = lower(search_term) OR
      lower(r.description) = lower(search_term) OR
      
      -- Starts with
      lower(r.city) LIKE lower(search_term) || '%' OR
      lower(r.location) LIKE lower(search_term) || '%' OR
      lower(r.title) LIKE lower(search_term) || '%' OR
      lower(r.address) LIKE lower(search_term) || '%' OR
      lower(r.description) LIKE lower(search_term) || '%' OR
      
      -- Contains
      lower(r.city) LIKE '%' || lower(search_term) || '%' OR
      lower(r.location) LIKE '%' || lower(search_term) || '%' OR
      lower(r.title) LIKE '%' || lower(search_term) || '%' OR
      lower(r.address) LIKE '%' || lower(search_term) || '%' OR
      lower(r.description) LIKE '%' || lower(search_term) || '%' OR
      
      -- Word-based (nếu search term có nhiều từ)
      (word_count > 1 AND (
        lower(r.city) LIKE '%' || search_words[1] || '%' OR
        lower(r.location) LIKE '%' || search_words[1] || '%' OR
        lower(r.title) LIKE '%' || search_words[1] || '%' OR
        lower(r.address) LIKE '%' || search_words[1] || '%' OR
        lower(r.description) LIKE '%' || search_words[1] || '%' OR
        lower(r.city) LIKE '%' || search_words[2] || '%' OR
        lower(r.location) LIKE '%' || search_words[2] || '%' OR
        lower(r.title) LIKE '%' || search_words[2] || '%' OR
        lower(r.address) LIKE '%' || search_words[2] || '%' OR
        lower(r.description) LIKE '%' || search_words[2] || '%' OR
        (word_count > 2 AND (
          lower(r.city) LIKE '%' || search_words[3] || '%' OR
          lower(r.location) LIKE '%' || search_words[3] || '%' OR
          lower(r.title) LIKE '%' || search_words[3] || '%' OR
          lower(r.address) LIKE '%' || search_words[3] || '%' OR
          lower(r.description) LIKE '%' || search_words[3] || '%'
        ))
      )) OR
      
      -- Normalized (điểm từ 45 trở lên) - lowercase
      lower(normalize_vietnamese_text(r.city)) LIKE '%' || lower(normalized_search) || '%' OR
      lower(normalize_vietnamese_text(r.location)) LIKE '%' || lower(normalized_search) || '%' OR
      lower(normalize_vietnamese_text(r.title)) LIKE '%' || lower(normalized_search) || '%' OR
      lower(normalize_vietnamese_text(r.address)) LIKE '%' || lower(normalized_search) || '%' OR
      
      -- No-space matches (điểm từ 41 trở lên) - lowercase
      lower(replace(normalize_vietnamese_text(r.city), ' ', '')) LIKE '%' || lower(normalized_search_no_space) || '%' OR
      lower(replace(normalize_vietnamese_text(r.location), ' ', '')) LIKE '%' || lower(normalized_search_no_space) || '%' OR
      lower(replace(normalize_vietnamese_text(r.title), ' ', '')) LIKE '%' || lower(normalized_search_no_space) || '%' OR
      lower(replace(normalize_vietnamese_text(r.address), ' ', '')) LIKE '%' || lower(normalized_search_no_space) || '%'
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
    -- Filter theo amenities (room phải có TẤT CẢ amenities được yêu cầu)
    AND (
      amenities_param IS NULL OR 
      amenities_param = '{}' OR
      array_length(amenities_param, 1) IS NULL OR
      (
        SELECT COUNT(*)
        FROM unnest(amenities_param) AS required_amenity
        WHERE required_amenity::text = ANY(r.amenities)
      ) = array_length(amenities_param, 1)
    )
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
GRANT EXECUTE ON FUNCTION search_rooms_nearby(NUMERIC, NUMERIC, DATE, DATE, INTEGER, INTEGER, NUMERIC, NUMERIC, TEXT, INTEGER[]) TO authenticated;

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

-- Test function - Search với amenities filter
SELECT * FROM search_rooms_nearby(
  search_term := 'Hồ Chí Minh',
  amenities_param := ARRAY[1, 2, 3]  -- Tìm rooms có WiFi (1), Điều hòa (2), Tủ lạnh (3)
);

-- Test function - Search với tất cả filters
SELECT * FROM search_rooms_nearby(
  search_term := 'Đà Lạt',
  check_in_date_param := '2025-01-15',
  check_out_date_param := '2025-01-20',
  max_guests_param := 2,
  min_price_param := 300000,
  max_price_param := 800000,
  amenities_param := ARRAY[1, 4]  -- WiFi và Ti vi
);
