-- Quick Test cho function search_rooms_nearby
-- Chạy từng lệnh một để test

-- Test 1: Basic search Q1 TP.HCM
SELECT * FROM search_rooms_nearby(
  lat_param := 10.762622,
  lng_param := 106.660172,
  radius_km_param := 10
);

-- Test 2: Search với dates
SELECT * FROM search_rooms_nearby(
  lat_param := 10.762622,
  lng_param := 106.660172,
  check_in_date_param := '2025-01-15',
  check_out_date_param := '2025-01-17',
  radius_km_param := 10
);

-- Test 3: Search với guests
SELECT * FROM search_rooms_nearby(
  lat_param := 10.762622,
  lng_param := 106.660172,
  radius_km_param := 10,
  max_guests_param := 2
);

-- Test 4: Search với price range
SELECT * FROM search_rooms_nearby(
  lat_param := 10.762622,
  lng_param := 106.660172,
  radius_km_param := 10,
  min_price_param := 300000,
  max_price_param := 800000
);

-- Test 5: Search Hà Nội
SELECT * FROM search_rooms_nearby(
  lat_param := 21.0285,
  lng_param := 105.8542,
  radius_km_param := 10
);

-- Test 6: Test distance calculation
SELECT calculate_distance_km(10.762622, 106.660172, 10.7769, 106.7009) as distance_km;
