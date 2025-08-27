-- Final Test cho function search_rooms_nearby (đã sửa tất cả parameter names)
-- Chạy từng lệnh một để test

-- Test 1: Basic search
SELECT 'TEST 1: Basic search' as test_name;
SELECT * FROM search_rooms_nearby(
  lat_param := 10.762622,
  lng_param := 106.660172,
  radius_km_param := 10
);

-- Test 2: Search với dates
SELECT 'TEST 2: Search với dates' as test_name;
SELECT * FROM search_rooms_nearby(
  lat_param := 10.762622,
  lng_param := 106.660172,
  check_in_date_param := '2025-01-15',
  check_out_date_param := '2025-01-17',
  radius_km_param := 10
);

-- Test 3: Search với guests
SELECT 'TEST 3: Search với guests' as test_name;
SELECT * FROM search_rooms_nearby(
  lat_param := 10.762622,
  lng_param := 106.660172,
  radius_km_param := 10,
  max_guests_param := 2
);

-- Test 4: Search với price range
SELECT 'TEST 4: Search với price range' as test_name;
SELECT * FROM search_rooms_nearby(
  lat_param := 10.762622,
  lng_param := 106.660172,
  radius_km_param := 10,
  min_price_param := 300000,
  max_price_param := 800000
);

-- Test 5: Search với tất cả filters
SELECT 'TEST 5: Search với tất cả filters' as test_name;
SELECT * FROM search_rooms_nearby(
  lat_param := 10.762622,
  lng_param := 106.660172,
  check_in_date_param := '2025-01-15',
  check_out_date_param := '2025-01-17',
  radius_km_param := 5,
  max_guests_param := 2,
  min_price_param := 300000,
  max_price_param := 800000
);

-- Test 6: Distance calculation
SELECT 'TEST 6: Distance calculation' as test_name;
SELECT calculate_distance_km(10.762622, 106.660172, 10.7769, 106.7009) as distance_km;
