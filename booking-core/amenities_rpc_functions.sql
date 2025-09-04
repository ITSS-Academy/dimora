-- RPC Function để lấy tất cả rooms với amenities đã join
CREATE OR REPLACE FUNCTION get_all_rooms_with_amenities()
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
      'postal_code', r.postal_code,
      'max_guests', r.max_guests,
      'bedrooms', r.bedrooms,
      'bathrooms', r.bathrooms,
      'beds', r.beds,
      'room_type_id', r.room_type_id,
      'amenities', (
        SELECT COALESCE(json_agg(
          json_build_object(
            'id', a.id,
            'name', a.name,
            'icon_name', a.icon_name
          )
        ), '[]'::json)
        FROM amenities a
        WHERE a.id::text = ANY(r.amenities)
      ),
      'images', r.images,
      'host_id', r.host_id,
      'is_available', r.is_available,
      'created_at', r.created_at,
      'updated_at', r.updated_at,
      'room_types', (
        SELECT json_build_object(
          'id', rt.id,
          'name', rt.name,
          'description', rt.description,
          'icon', rt.icon
        )
        FROM room_types rt
        WHERE rt.id = r.room_type_id
      )
    )
    ORDER BY r.created_at DESC
  ) INTO result
  FROM rooms r
  WHERE r.is_available = true;
  
  RETURN COALESCE(result, '[]'::json);
END;
$$;

-- RPC Function để lấy room theo ID với amenities đã join
CREATE OR REPLACE FUNCTION get_room_by_id_with_amenities(room_id UUID)
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
      'postal_code', r.postal_code,
      'max_guests', r.max_guests,
      'bedrooms', r.bedrooms,
      'bathrooms', r.bathrooms,
      'beds', r.beds,
      'room_type_id', r.room_type_id,
      'amenities', (
        SELECT COALESCE(json_agg(
          json_build_object(
            'id', a.id,
            'name', a.name,
            'icon_name', a.icon_name
          )
        ), '[]'::json)
        FROM amenities a
        WHERE a.id::text = ANY(r.amenities)
      ),
      'images', r.images,
      'host_id', r.host_id,
      'is_available', r.is_available,
      'created_at', r.created_at,
      'updated_at', r.updated_at,
      'room_types', (
        SELECT json_build_object(
          'id', rt.id,
          'name', rt.name,
          'description', rt.description,
          'icon', rt.icon
        )
        FROM room_types rt
        WHERE rt.id = r.room_type_id
      )
    )
  ) INTO result
  FROM rooms r
  WHERE r.id = room_id;
  
  RETURN COALESCE(result, '[]'::json);
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_all_rooms_with_amenities() TO authenticated;
GRANT EXECUTE ON FUNCTION get_room_by_id_with_amenities(UUID) TO authenticated;

-- Test functions
SELECT * FROM get_all_rooms_with_amenities();
SELECT * FROM get_room_by_id_with_amenities('550e8400-e29b-41d4-a716-446655440000'::uuid);
