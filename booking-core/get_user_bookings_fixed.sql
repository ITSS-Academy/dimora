-- Fix RPC Function get_user_bookings
-- Sửa lỗi GROUP BY clause bằng cách sử dụng JSON return

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
        'country', r.country,
        'latitude', r.latitude,
        'longitude', r.longitude,
        'price_per_night', r.price_per_night,
        'images', r.images
      ),
      'hosts', json_build_object(
        'id', h.id,
        'email', h.email,
        'full_name', h.full_name,
        'phone', h.phone,
        'avatar_url', h.avatar_url
      )
    )
    ORDER BY b.created_at DESC
  ) INTO result
  FROM bookings b
  LEFT JOIN rooms r ON b.room_id = r.id
  LEFT JOIN users h ON b.host_id = h.id
  WHERE b.user_id = user_uuid;
  
  RETURN COALESCE(result, '[]'::json);
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_user_bookings(UUID) TO authenticated;
