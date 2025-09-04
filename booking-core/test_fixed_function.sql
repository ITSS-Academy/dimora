-- Test function sau khi sửa lỗi ambiguous column
-- Chạy từng lệnh một

-- Test 1: Basic search (không có max_guests)
SELECT 'TEST 1: Basic search' as test_name;
SELECT * FROM search_rooms_nearby(
  lat_param := 10.762622,
  lng_param := 106.660172,
  radius_km_param := 10
);

-- Test 2: Search với max_guests_param
SELECT 'TEST 2: Search với max_guests_param' as test_name;
SELECT * FROM search_rooms_nearby(
  lat_param := 10.762622,
  lng_param := 106.660172,
  radius_km_param := 10,
  max_guests_param := 2
);

-- Test 3: Search với dates và max_guests_param
SELECT 'TEST 3: Search với dates và max_guests_param' as test_name;
SELECT * FROM search_rooms_nearby(
  lat_param := 10.762622,
  lng_param := 106.660172,
  check_in_date_param := '2025-01-15',
  check_out_date_param := '2025-01-17',
  radius_km_param := 10,
  max_guests_param := 2
);

-- Test 4: Distance calculation
SELECT 'TEST 4: Distance calculation' as test_name;
SELECT calculate_distance_km(10.762622, 106.660172, 10.7769, 106.7009) as distance_km;
