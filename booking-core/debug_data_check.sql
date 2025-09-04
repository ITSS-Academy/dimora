-- Debug Data Check - Kiểm tra data thực tế

-- 1. Xem tổng số rooms
SELECT COUNT(*) as total_rooms FROM rooms;

-- 2. Xem rooms available
SELECT COUNT(*) as available_rooms FROM rooms WHERE is_available = true;

-- 3. Xem sample data
SELECT id, title, city, location, address, is_available, latitude, longitude
FROM rooms 
LIMIT 5;

-- 4. Xem tất cả cities có trong database
SELECT DISTINCT city FROM rooms WHERE is_available = true ORDER BY city;

-- 5. Xem tất cả locations có trong database
SELECT DISTINCT location FROM rooms WHERE is_available = true ORDER BY location;

-- 6. Test search trực tiếp với "da lat"
SELECT id, title, city, location, address
FROM rooms 
WHERE is_available = true 
AND (
  lower(city) LIKE '%da lat%' OR
  lower(city) LIKE '%đà lạt%' OR
  lower(location) LIKE '%da lat%' OR
  lower(location) LIKE '%đà lạt%' OR
  lower(address) LIKE '%da lat%' OR
  lower(address) LIKE '%đà lạt%'
);

-- 7. Test search với "vung tau"
SELECT id, title, city, location, address
FROM rooms 
WHERE is_available = true 
AND (
  lower(city) LIKE '%vung tau%' OR
  lower(city) LIKE '%vũng tàu%' OR
  lower(location) LIKE '%vung tau%' OR
  lower(location) LIKE '%vũng tàu%' OR
  lower(address) LIKE '%vung tau%' OR
  lower(address) LIKE '%vũng tàu%'
);

-- 8. Test search với "ho chi minh"
SELECT id, title, city, location, address
FROM rooms 
WHERE is_available = true 
AND (
  lower(city) LIKE '%ho chi minh%' OR
  lower(city) LIKE '%hồ chí minh%' OR
  lower(location) LIKE '%ho chi minh%' OR
  lower(location) LIKE '%hồ chí minh%' OR
  lower(address) LIKE '%ho chi minh%' OR
  lower(address) LIKE '%hồ chí minh%'
);

-- 9. Test normalize function
SELECT 'Đà Lạt' as original, normalize_vietnamese_text('Đà Lạt') as normalized;
SELECT 'Vũng Tàu' as original, normalize_vietnamese_text('Vũng Tàu') as normalized;
SELECT 'Hồ Chí Minh' as original, normalize_vietnamese_text('Hồ Chí Minh') as normalized;
