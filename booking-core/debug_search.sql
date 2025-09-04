-- Debug Search - Kiểm tra từng bước

-- 1. Kiểm tra có rooms nào không
SELECT COUNT(*) as total_rooms FROM rooms;

-- 2. Kiểm tra có rooms available không
SELECT COUNT(*) as available_rooms FROM rooms WHERE is_available = true;

-- 3. Kiểm tra normalize function có hoạt động không
SELECT normalize_vietnamese_text('Đà Lạt') as normalized_da_lat;
SELECT normalize_vietnamese_text('Da Lat') as normalized_da_lat_2;

-- 4. Kiểm tra có rooms nào có city chứa "da lat" không
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

-- 5. Test normalize search
SELECT id, title, city, location, address,
       normalize_vietnamese_text(city) as normalized_city,
       normalize_vietnamese_text(location) as normalized_location
FROM rooms 
WHERE is_available = true 
AND (
  normalize_vietnamese_text(city) LIKE '%da lat%' OR
  normalize_vietnamese_text(location) LIKE '%da lat%' OR
  normalize_vietnamese_text(address) LIKE '%da lat%'
);

-- 6. Test search function đơn giản
SELECT * FROM search_rooms_nearby();

-- 7. Test search với term đơn giản
SELECT * FROM search_rooms_nearby(
  search_term := 'test'
);

-- 8. Test search với term có dấu
SELECT * FROM search_rooms_nearby(
  search_term := 'Đà Lạt'
);

-- 9. Test search với term không dấu
SELECT * FROM search_rooms_nearby(
  search_term := 'da lat'
);

-- 10. Test search với term gộp
SELECT * FROM search_rooms_nearby(
  search_term := 'dalat'
);
