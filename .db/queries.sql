-- Basic Queries
-- 1. Get all available pets with their shelter information
SELECT p.*,
    s.name as shelter_name
FROM pet p
    JOIN shelter s ON p.shelter_id = s.id
WHERE p.status = 'AVAILABLE';
-- 2. Find all users who have bookmarked pets
SELECT u.username,
    COUNT(b.pet_id) as bookmarked_pets_count
FROM "user" u
    JOIN bookmark b ON u.id = b.user_id
GROUP BY u.username
ORDER BY bookmarked_pets_count DESC;
-- 3. Get all unread messages for a specific user
-- Note: Replace the UUID below with an actual user's UUID
-- Example UUID format: '123e4567-e89b-12d3-a456-426614174000'
SELECT m.*,
    u.username as sender_username
FROM message m
    JOIN "user" u ON m.sender_id = u.id
WHERE m.receiver_id = '794e765f-1af7-470b-afa0-47d6d1a47f4b'
    AND m.is_read = false;
-- Alternative parameterized version using prepared statement:
-- PREPARE get_unread_messages(uuid) AS
-- SELECT m.*, u.username as sender_username
-- FROM message m
-- JOIN "user" u ON m.sender_id = u.id
-- WHERE m.receiver_id = $1 AND m.is_read = false;
-- EXECUTE get_unread_messages('user-uuid-here');
-- More Complex Queries
-- 4. Find shelters with the most adopted pets in the last month
SELECT s.name,
    COUNT(p.id) as adopted_pets_count
FROM shelter s
    JOIN pet p ON s.id = p.shelter_id
WHERE p.status = 'ADOPTED'
    AND p.created_at >= NOW() - INTERVAL '1 month'
GROUP BY s.name
ORDER BY adopted_pets_count DESC
LIMIT 5;
-- 5. Get pets with their primary images and shelter information
SELECT p.*,
    i.url as primary_image_url,
    s.name as shelter_name,
    a."formattedAddress" as shelter_address
FROM pet p
    LEFT JOIN pet_image pi ON p.id = pi.pet_id
    AND pi.is_primary = true
    LEFT JOIN image i ON pi.image_id = i.id
    LEFT JOIN shelter s ON p.shelter_id = s.id
    LEFT JOIN address a ON a.id = s.address_id;
-- 6. Find users who are members of multiple shelters
SELECT u.username,
    COUNT(DISTINCT sm.shelter_id) as shelter_count,
    array_agg(s.name) as shelter_names
FROM "user" u
    JOIN shelter_member sm ON u.id = sm.user_id
    JOIN shelter s ON sm.shelter_id = s.id
GROUP BY u.username
HAVING COUNT(DISTINCT sm.shelter_id) > 1;
-- 7. Get message statistics for shelters
SELECT s.name,
    COUNT(m.id) as total_messages,
    COUNT(DISTINCT m.sender_id) as unique_senders,
    COUNT(DISTINCT sma.user_id) as assigned_staff
FROM shelter s
    LEFT JOIN message m ON s.id = m.shelter_id
    LEFT JOIN shelter_message_assignment sma ON m.id = sma.message_id
GROUP BY s.name;
-- 8. Find pets with the most bookmarks and their shelter information
SELECT p.name as pet_name,
    p.species,
    s.name as shelter_name,
    COUNT(b.user_id) as bookmark_count
FROM pet p
    LEFT JOIN bookmark b ON p.id = b.pet_id
    LEFT JOIN shelter s ON p.shelter_id = s.id
GROUP BY p.id,
    p.name,
    p.species,
    s.name
HAVING COUNT(b.user_id) > 0
ORDER BY bookmark_count DESC;
-- 9. Get shelter staff activity metrics
SELECT u.username,
    s.name as shelter_name,
    COUNT(DISTINCT p.id) as pets_created,
    COUNT(DISTINCT sma.message_id) as messages_handled
FROM "user" u
    JOIN shelter_member sm ON u.id = sm.user_id
    JOIN shelter s ON sm.shelter_id = s.id
    LEFT JOIN pet p ON u.id = p.created_by_user_id
    LEFT JOIN shelter_message_assignment sma ON u.id = sma.user_id
GROUP BY u.username,
    s.name;
-- 10. Find nearby shelters within 10km radius of a given location
WITH given_location AS (
    SELECT 40.7128 as lat,
        -- Example: New York City coordinates
        -74.0060 as lng
)
SELECT *
FROM (
        SELECT s.name,
            a."formattedAddress",
            a.lat,
            a.lng,
            -- Haversine formula for calculating distance
            6371 * acos(
                cos(radians(gl.lat)) * cos(radians(a.lat)) * cos(radians(a.lng) - radians(gl.lng)) + sin(radians(gl.lat)) * sin(radians(a.lat))
            ) as distance_km
        FROM shelter s
            JOIN address a ON s.address_id = a.id
            CROSS JOIN given_location gl
    ) distances
WHERE distance_km <= 10
ORDER BY distance_km;
-- 11. Get age distribution of pets by species and shelter
SELECT s.name as shelter_name,
    p.species,
    CASE
        WHEN age(CURRENT_DATE, p."birthDate") < interval '1 year' THEN 'Under 1 year'
        WHEN age(CURRENT_DATE, p."birthDate") < interval '3 years' THEN '1-3 years'
        WHEN age(CURRENT_DATE, p."birthDate") < interval '7 years' THEN '3-7 years'
        ELSE 'Over 7 years'
    END as age_group,
    COUNT(*) as pet_count
FROM pet p
    JOIN shelter s ON p.shelter_id = s.id
GROUP BY s.name,
    p.species,
    age_group
ORDER BY s.name,
    p.species,
    age_group;
-- 12. Find users who have both sent and received messages to/from the same shelter
SELECT DISTINCT u.username,
    s.name as shelter_name
FROM "user" u
    JOIN message m1 ON u.id = m1.sender_id
    JOIN message m2 ON u.id = m2.receiver_id
    JOIN shelter s ON m1.shelter_id = m2.shelter_id
    AND m1.shelter_id = s.id;
-- 13. Get comprehensive pet profile with all related information
SELECT p.name,
    p.species,
    p.breed,
    p.gender,
    p.status,
    s.name as shelter_name,
    a."formattedAddress" as shelter_address,
    array_agg(DISTINCT i.url) as image_urls,
    COUNT(DISTINCT b.user_id) as bookmark_count,
    u.username as created_by
FROM pet p
    LEFT JOIN shelter s ON p.shelter_id = s.id
    LEFT JOIN address a ON s.address_id = a.id
    LEFT JOIN pet_image pi ON p.id = pi.pet_id
    LEFT JOIN image i ON pi.image_id = i.id
    LEFT JOIN bookmark b ON p.id = b.pet_id
    LEFT JOIN "user" u ON p.created_by_user_id = u.id
GROUP BY p.id,
    p.name,
    p.species,
    p.breed,
    p.gender,
    p.status,
    s.name,
    a."formattedAddress",
    u.username;