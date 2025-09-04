-- Test SQL cho function search_rooms_nearby
-- Chạy các lệnh này sau khi đã tạo function

-- ========================================
-- TEST 1: Basic Search (chỉ location)
-- ========================================
SELECT 'TEST 1: Basic Search - Q1 TP.HCM' as test_name;

SELECT * FROM search_rooms_nearby(
  lat := 10.762622,  -- Vĩ độ Q1 TP.HCM
  lng := 106.660172, -- Kinh độ Q1 TP.HCM
  radius_km := 10
);

-- ========================================
-- TEST 2: Search với dates và guests
-- ========================================
SELECT 'TEST 2: Search với dates và guests' as test_name;

SELECT * FROM search_rooms_nearby(
  lat := 10.762622,
  lng := 106.660172,
  check_in_date := '2025-01-15',
  check_out_date := '2025-01-17',
  radius_km := 10,
  max_guests_param := 2
);

-- ========================================
-- TEST 3: Search với price range
-- ========================================
SELECT 'TEST 3: Search với price range' as test_name;

SELECT * FROM search_rooms_nearby(
  lat := 10.762622,
  lng := 106.660172,
  radius_km := 10,
  min_price := 300000,
  max_price := 800000
);

-- ========================================
-- TEST 4: Search với tất cả filters
-- ========================================
SELECT 'TEST 4: Search với tất cả filters' as test_name;

SELECT * FROM search_rooms_nearby(
  lat := 10.762622,
  lng := 106.660172,
  check_in_date := '2025-01-15',
  check_out_date := '2025-01-17',
  radius_km := 5,
  max_guests_param := 2,
  min_price := 300000,
  max_price := 800000
);

-- ========================================
-- TEST 5: Search Hà Nội (Hồ Hoàn Kiếm)
-- ========================================
SELECT 'TEST 5: Search Hà Nội - Hồ Hoàn Kiếm' as test_name;

SELECT * FROM search_rooms_nearby(
  lat := 21.0285,  -- Vĩ độ Hồ Hoàn Kiếm
  lng := 105.8542, -- Kinh độ Hồ Hoàn Kiếm
  radius_km := 10,
  max_guests_param := 4
);

-- ========================================
-- TEST 6: Search Đà Nẵng (Bãi biển Mỹ Khê)
-- ========================================
SELECT 'TEST 6: Search Đà Nẵng - Bãi biển Mỹ Khê' as test_name;

SELECT * FROM search_rooms_nearby(
  lat := 16.0544,  -- Vĩ độ Bãi biển Mỹ Khê
  lng := 108.2022, -- Kinh độ Bãi biển Mỹ Khê
  radius_km := 15,
  min_price := 200000,
  max_price := 1000000
);

-- ========================================
-- TEST 7: Search với radius nhỏ
-- ========================================
SELECT 'TEST 7: Search với radius nhỏ (2km)' as test_name;

SELECT * FROM search_rooms_nearby(
  lat := 10.762622,
  lng := 106.660172,
  radius_km := 2
);

-- ========================================
-- TEST 8: Search với radius lớn
-- ========================================
SELECT 'TEST 8: Search với radius lớn (50km)' as test_name;

SELECT * FROM search_rooms_nearby(
  lat := 10.762622,
  lng := 106.660172,
  radius_km := 50
);

-- ========================================
-- TEST 9: Search chỉ với dates (không có guests)
-- ========================================
SELECT 'TEST 9: Search chỉ với dates' as test_name;

SELECT * FROM search_rooms_nearby(
  lat := 10.762622,
  lng := 106.660172,
  check_in_date := '2025-01-15',
  check_out_date := '2025-01-17',
  radius_km := 10
);

-- ========================================
-- TEST 10: Search chỉ với guests (không có dates)
-- ========================================
SELECT 'TEST 10: Search chỉ với guests' as test_name;

SELECT * FROM search_rooms_nearby(
  lat := 10.762622,
  lng := 106.660172,
  radius_km := 10,
  max_guests_param := 6
);

-- ========================================
-- TEST 11: Search với coordinates không có rooms
-- ========================================
SELECT 'TEST 11: Search vùng không có rooms' as test_name;

SELECT * FROM search_rooms_nearby(
  lat := 20.0,  -- Vùng xa
  lng := 100.0, -- Vùng xa
  radius_km := 10
);

-- ========================================
-- TEST 12: Test distance calculation function
-- ========================================
SELECT 'TEST 12: Test distance calculation' as test_name;

SELECT 
  calculate_distance_km(10.762622, 106.660172, 10.7769, 106.7009) as distance_q1_to_q2,
  calculate_distance_km(21.0285, 105.8542, 21.0367, 105.8342) as distance_hanoi_center,
  calculate_distance_km(16.0544, 108.2022, 16.0597, 108.2069) as distance_danang_beach;

-- ========================================
-- TEST 13: Performance test - Count rooms
-- ========================================
SELECT 'TEST 13: Count rooms trong radius' as test_name;

SELECT 
  COUNT(*) as total_rooms,
  COUNT(CASE WHEN price_per_night BETWEEN 300000 AND 800000 THEN 1 END) as rooms_in_price_range,
  COUNT(CASE WHEN max_guests >= 2 THEN 1 END) as rooms_for_2_guests
FROM search_rooms_nearby(
  lat := 10.762622,
  lng := 106.660172,
  radius_km := 10
);

-- ========================================
-- TEST 14: Search với dates trong tương lai xa
-- ========================================
SELECT 'TEST 14: Search với dates tương lai xa' as test_name;

SELECT * FROM search_rooms_nearby(
  lat := 10.762622,
  lng := 106.660172,
  check_in_date := '2025-12-25',
  check_out_date := '2025-12-30',
  radius_km := 10,
  max_guests_param := 2
);

-- ========================================
-- TEST 15: Search với giá cao
-- ========================================
SELECT 'TEST 15: Search với giá cao' as test_name;

SELECT * FROM search_rooms_nearby(
  lat := 10.762622,
  lng := 106.660172,
  radius_km := 10,
  min_price := 1000000,
  max_price := 5000000
);
