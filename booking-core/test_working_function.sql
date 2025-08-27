-- Test function sau khi sửa lỗi GROUP BY
-- Chạy từng lệnh một

-- Test 1: Basic search (không có filters)
SELECT 'TEST 1: Basic search' as test_name;
SELECT * FROM search_rooms_nearby(
  lat_param := 10.762622,
  lng_param := 106.660172,
  radius_km_param := 10
);

-- Test 2: Search với radius nhỏ
SELECT 'TEST 2: Search với radius nhỏ' as test_name;
SELECT * FROM search_rooms_nearby(
  lat_param := 10.762622,
  lng_param := 106.660172,
  radius_km_param := 2
);

-- Test 3: Search với radius lớn
SELECT 'TEST 3: Search với radius lớn' as test_name;
SELECT * FROM search_rooms_nearby(
  lat_param := 10.762622,
  lng_param := 106.660172,
  radius_km_param := 50
);

-- Test 4: Distance calculation function
SELECT 'TEST 4: Distance calculation' as test_name;
SELECT calculate_distance_km(10.762622, 106.660172, 10.7769, 106.7009) as distance_km;
