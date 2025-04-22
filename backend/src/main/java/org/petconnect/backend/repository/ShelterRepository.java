package org.petconnect.backend.repository;

import java.util.List;
import java.util.UUID;

import org.petconnect.backend.model.Shelter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ShelterRepository extends JpaRepository<Shelter, UUID> {

    @Query(value = """
            WITH shelter_distances AS (
                SELECT s.*,
                CASE
                    WHEN :lat IS NOT NULL AND :lng IS NOT NULL THEN
                        earth_distance(
                            ll_to_earth(:lat, :lng),
                            ll_to_earth(
                                (SELECT a.lat FROM address a
                                 JOIN shelter_address sa ON sa.address_id = a.id
                                 WHERE sa.shelter_id = s.id),
                                (SELECT a.lng FROM address a
                                 JOIN shelter_address sa ON sa.address_id = a.id
                                 WHERE sa.shelter_id = s.id)
                            )
                        ) / 1609.34  -- Convert meters to miles
                    ELSE NULL
                END as distance_miles
            FROM shelter s)
            SELECT * FROM shelter_distances s
            WHERE (:searchQuery IS NULL OR
                  LOWER(s.name) LIKE LOWER(CONCAT('%', :searchQuery, '%')) OR
                  LOWER(CAST(s.description AS TEXT)) LIKE LOWER(CONCAT('%', :searchQuery, '%')))
            AND (:city IS NULL OR EXISTS (
                SELECT 1 FROM address a
                JOIN shelter_address sa ON sa.address_id = a.id
                WHERE sa.shelter_id = s.id AND LOWER(a.city) = LOWER(:city)
            ))
            AND (:country IS NULL OR EXISTS (
                SELECT 1 FROM address a
                JOIN shelter_address sa ON sa.address_id = a.id
                WHERE sa.shelter_id = s.id AND LOWER(a.country) = LOWER(:country)
            ))
            ORDER BY
            CASE
                WHEN COALESCE(:sortBy, 'newest') = 'newest' THEN s.created_at
            END DESC NULLS LAST,
            CASE
                WHEN :sortBy = 'oldest' THEN s.created_at
            END ASC NULLS LAST,
            CASE
                WHEN :sortBy = 'name_asc' THEN s.name
            END ASC NULLS LAST,
            CASE
                WHEN :sortBy = 'name_desc' THEN s.name
            END DESC NULLS LAST,
            CASE
                WHEN :sortBy = 'distance' AND :lat IS NOT NULL AND :lng IS NOT NULL THEN distance_miles
            END ASC NULLS LAST,
            s.id DESC
            LIMIT :limit OFFSET :offset
            """, nativeQuery = true)
    List<Shelter> findSheltersByFilters(
            @Param("searchQuery") String searchQuery,
            @Param("sortBy") String sortBy,
            @Param("lat") Double lat,
            @Param("lng") Double lng,
            @Param("city") String city,
            @Param("country") String country,
            @Param("limit") int limit,
            @Param("offset") int offset);

    @Query(value = """
            SELECT COUNT(*) FROM shelter s
            WHERE (:searchQuery IS NULL OR
                   LOWER(s.name) LIKE LOWER(CONCAT('%', :searchQuery, '%')) OR
                   LOWER(CAST(s.description AS TEXT)) LIKE LOWER(CONCAT('%', :searchQuery, '%')))
            AND (:city IS NULL OR EXISTS (
                SELECT 1 FROM address a
                JOIN shelter_address sa ON sa.address_id = a.id
                WHERE sa.shelter_id = s.id AND LOWER(a.city) = LOWER(:city)
            ))
            AND (:country IS NULL OR EXISTS (
                SELECT 1 FROM address a
                JOIN shelter_address sa ON sa.address_id = a.id
                WHERE sa.shelter_id = s.id AND LOWER(a.country) = LOWER(:country)
            ))
            """, nativeQuery = true)
    long countSheltersByFilters(
            @Param("searchQuery") String searchQuery,
            @Param("city") String city,
            @Param("country") String country);

    @Query(value = """
            SELECT * FROM shelter s
            WHERE s.owner_id = :ownerId
            ORDER BY s.created_at DESC
            LIMIT :limit OFFSET :offset
            """, nativeQuery = true)
    List<Shelter> findByOwnerIdOrderByCreatedAtDesc(
            @Param("ownerId") UUID ownerId,
            @Param("limit") int limit,
            @Param("offset") int offset);

    @Query("SELECT COUNT(s) FROM Shelter s WHERE s.ownerId = :ownerId")
    long countByOwnerId(@Param("ownerId") UUID ownerId);
}