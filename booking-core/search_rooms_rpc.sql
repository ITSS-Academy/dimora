-- RPC Function để search rooms với coordinates
-- Sử dụng PostGIS để tính khoảng cách

-- Enable PostGIS extension nếu chưa có
CREATE EXTENSION IF NOT EXISTS postgis;

-- Function để search rooms nearby
CREATE OR REPLACE FUNCTION search_rooms_nearby(
  lat DECIMAL(10,8),
  lng DECIMAL(11,8),
  radius_km INTEGER DEFAULT 10,
  max_guests INTEGER DEFAULT NULL,
  min_price DECIMAL(12,2) DEFAULT NULL,
  max_price DECIMAL(12,2) DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  price_per_night DECIMAL(12,2),
  location TEXT,
  address TEXT,
  city TEXT,
  country TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  max_guests INTEGER,
  bedrooms INTEGER,
  bathrooms INTEGER,
  beds INTEGER,
  room_type_id UUID,
  amenities TEXT[],
  images TEXT[],
  host_id UUID,
  is_available BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  distance_km DECIMAL(10,2)
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.title,
    r.description,
    r.price_per_night,
    r.location,
    r.address,
    r.city,
    r.country,
    r.latitude,
    r.longitude,
    r.max_guests,
    r.bedrooms,
    r.bathrooms,
    r.beds,
    r.room_type_id,
    r.amenities,
    r.images,
    r.host_id,
    r.is_available,
    r.created_at,
    r.updated_at,
    -- Tính khoảng cách bằng PostGIS (km)
    ST_Distance(
      ST_MakePoint(r.longitude, r.latitude)::geography,
      ST_MakePoint(lng, lat)::geography
    ) / 1000.0 as distance_km
  FROM rooms r
  WHERE 
    r.is_available = true
    AND r.latitude IS NOT NULL 
    AND r.longitude IS NOT NULL
    -- Filter theo khoảng cách
    AND ST_DWithin(
      ST_MakePoint(r.longitude, r.latitude)::geography,
      ST_MakePoint(lng, lat)::geography,
      radius_km * 1000  -- Convert km to meters
    )
    -- Filter theo số khách
    AND (max_guests IS NULL OR r.max_guests >= max_guests)
    -- Filter theo giá
    AND (min_price IS NULL OR r.price_per_night >= min_price)
    AND (max_price IS NULL OR r.price_per_night <= max_price)
  ORDER BY distance_km ASC;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION search_rooms_nearby(DECIMAL, DECIMAL, INTEGER, INTEGER, DECIMAL, DECIMAL) TO authenticated;

-- Tạo index cho geospatial queries (nếu chưa có)
CREATE INDEX IF NOT EXISTS idx_rooms_location ON rooms USING GIST (ST_MakePoint(longitude, latitude));

-- Tạo index cho các filter khác
CREATE INDEX IF NOT EXISTS idx_rooms_available ON rooms(is_available) WHERE is_available = true;
CREATE INDEX IF NOT EXISTS idx_rooms_max_guests ON rooms(max_guests);
CREATE INDEX IF NOT EXISTS idx_rooms_price ON rooms(price_per_night);
CREATE INDEX IF NOT EXISTS idx_rooms_city ON rooms(city);
