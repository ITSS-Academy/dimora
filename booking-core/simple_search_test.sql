-- Simple Search Test - Function đơn giản để debug

-- Function search đơn giản
CREATE OR REPLACE FUNCTION simple_search_rooms(search_term TEXT)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_agg(
    json_build_object(
      'id', r.id,
      'title', r.title,
      'city', r.city,
      'location', r.location,
      'address', r.address,
      'is_available', r.is_available
    )
  ) INTO result
  FROM rooms r
  WHERE 
    r.is_available = true
    AND (
      -- Exact match
      lower(r.city) = lower(search_term) OR
      lower(r.location) = lower(search_term) OR
      lower(r.address) = lower(search_term) OR
      
      -- Partial match
      lower(r.city) LIKE '%' || lower(search_term) || '%' OR
      lower(r.location) LIKE '%' || lower(search_term) || '%' OR
      lower(r.address) LIKE '%' || lower(search_term) || '%'
    );
  
  RETURN COALESCE(result, '[]'::json);
END;
$$;

-- Grant permission
GRANT EXECUTE ON FUNCTION simple_search_rooms(TEXT) TO authenticated;

-- Test function
SELECT * FROM simple_search_rooms('da lat');
SELECT * FROM simple_search_rooms('Đà Lạt');
SELECT * FROM simple_search_rooms('dalat');
SELECT * FROM simple_search_rooms('test');
