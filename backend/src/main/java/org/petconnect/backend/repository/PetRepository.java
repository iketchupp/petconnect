package org.petconnect.backend.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.petconnect.backend.model.Pet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PetRepository extends JpaRepository<Pet, UUID> {

    @Query(value = """
            WITH pet_distances AS (
                SELECT p.*,
                CASE
                    WHEN :lat IS NOT NULL AND :lng IS NOT NULL THEN
                        earth_distance(
                            ll_to_earth(:lat, :lng),
                            ll_to_earth(
                                COALESCE((SELECT a.lat FROM address a
                                         JOIN pet_address pa ON pa.address_id = a.id
                                         WHERE pa.pet_id = p.id),
                                        (SELECT a.lat FROM address a
                                         JOIN shelter_address sa ON sa.address_id = a.id
                                         WHERE sa.shelter_id = p.shelter_id)),
                                COALESCE((SELECT a.lng FROM address a
                                         JOIN pet_address pa ON pa.address_id = a.id
                                         WHERE pa.pet_id = p.id),
                                        (SELECT a.lng FROM address a
                                         JOIN shelter_address sa ON sa.address_id = a.id
                                         WHERE sa.shelter_id = p.shelter_id))
                            )
                        ) / 1609.34  -- Convert meters to miles
                    ELSE NULL
                END as distance_miles
            FROM pet p)
            SELECT * FROM pet_distances p
            WHERE
            (COALESCE(:species, p.species) IS NULL OR LOWER(p.species) = LOWER(COALESCE(:species, p.species)))
            AND
            (COALESCE(:breed, p.breed) IS NULL OR LOWER(p.breed) = LOWER(COALESCE(:breed, p.breed)))
            AND
            (COALESCE(:gender, p.gender) IS NULL OR LOWER(p.gender) = LOWER(COALESCE(:gender, p.gender)))
            AND
            (p.birth_date <= COALESCE(CAST(:minDate AS timestamp), p.birth_date))
            AND
            (p.birth_date >= COALESCE(CAST(:maxDate AS timestamp), p.birth_date))
            AND
            p.status = 'AVAILABLE'
            AND
            (COALESCE(:searchQuery, '') = '' OR
              LOWER(p.name::text) LIKE LOWER(CONCAT('%', :searchQuery, '%')) OR
              (p.description IS NOT NULL AND LOWER(p.description::text) LIKE LOWER(CONCAT('%', :searchQuery, '%'))))
            AND
            (:city IS NULL OR EXISTS (
                SELECT 1 FROM address a
                LEFT JOIN pet_address pa ON pa.address_id = a.id AND pa.pet_id = p.id
                LEFT JOIN shelter_address sa ON sa.address_id = a.id AND sa.shelter_id = p.shelter_id
                WHERE (pa.pet_id = p.id OR sa.shelter_id = p.shelter_id) AND LOWER(a.city) = LOWER(:city)
            ))
            AND
            (:country IS NULL OR EXISTS (
                SELECT 1 FROM address a
                LEFT JOIN pet_address pa ON pa.address_id = a.id AND pa.pet_id = p.id
                LEFT JOIN shelter_address sa ON sa.address_id = a.id AND sa.shelter_id = p.shelter_id
                WHERE (pa.pet_id = p.id OR sa.shelter_id = p.shelter_id) AND LOWER(a.country) = LOWER(:country)
            ))
            ORDER BY
            CASE
                WHEN COALESCE(:sortBy, 'newest') = 'newest' THEN p.created_at
            END DESC NULLS LAST,
            CASE
                WHEN :sortBy = 'oldest' THEN p.created_at
            END ASC NULLS LAST,
            CASE
                WHEN :sortBy = 'youngest' THEN p.birth_date
            END DESC NULLS LAST,
            CASE
                WHEN :sortBy = 'eldest' THEN p.birth_date
            END ASC NULLS LAST,
            CASE
                WHEN :sortBy = 'name_asc' THEN p.name
            END ASC NULLS LAST,
            CASE
                WHEN :sortBy = 'name_desc' THEN p.name
            END DESC NULLS LAST,
            CASE
                WHEN :sortBy = 'distance' AND :lat IS NOT NULL AND :lng IS NOT NULL THEN distance_miles
            END ASC NULLS LAST,
            p.id DESC
            LIMIT :limit OFFSET :offset
            """, nativeQuery = true)
    List<Pet> findPetsByFilters(
            @Param("species") String species,
            @Param("breed") String breed,
            @Param("gender") String gender,
            @Param("minDate") LocalDateTime minDate,
            @Param("maxDate") LocalDateTime maxDate,
            @Param("searchQuery") String searchQuery,
            @Param("sortBy") String sortBy,
            @Param("lat") Double lat,
            @Param("lng") Double lng,
            @Param("city") String city,
            @Param("country") String country,
            @Param("limit") int limit,
            @Param("offset") int offset);

    @Query("""
                SELECT p FROM Pet p
                WHERE p.id = :id
            """)
    Pet findPetById(@Param("id") UUID id);

    @Query("SELECT DISTINCT LOWER(p.species) FROM Pet p ORDER BY LOWER(p.species)")
    List<String> findAllSpecies();

    @Query("SELECT DISTINCT LOWER(p.breed) FROM Pet p WHERE LOWER(p.species) = LOWER(:species) ORDER BY LOWER(p.breed)")
    List<String> findBreedsBySpecies(@Param("species") String species);

    @Query("SELECT DISTINCT LOWER(p.gender) FROM Pet p ORDER BY LOWER(p.gender)")
    List<String> findAllGenders();

    List<Pet> findByShelterIdOrderByCreatedAtDesc(UUID shelterId);

    @Query(value = """
            SELECT * FROM pet p
            WHERE p.created_by_user_id = :userId
            ORDER BY p.created_at DESC
            LIMIT :limit OFFSET :offset
            """, nativeQuery = true)
    List<Pet> findByOwnerIdWithPagination(
            @Param("userId") UUID userId,
            @Param("limit") int limit,
            @Param("offset") int offset);

    @Query("SELECT COUNT(p) FROM Pet p WHERE p.createdByUserId = :userId")
    long countByOwnerId(@Param("userId") UUID userId);

    @Query("SELECT COUNT(p) FROM Pet p WHERE p.shelterId = :shelterId AND p.status = 'AVAILABLE'")
    long countByShelterIdAndStatusAvailable(@Param("shelterId") UUID shelterId);

    @Query(value = """
            SELECT COUNT(*) FROM pet p
            WHERE
            (COALESCE(:species, p.species) IS NULL OR LOWER(p.species) = LOWER(COALESCE(:species, p.species)))
            AND
            (COALESCE(:breed, p.breed) IS NULL OR LOWER(p.breed) = LOWER(COALESCE(:breed, p.breed)))
            AND
            (COALESCE(:gender, p.gender) IS NULL OR LOWER(p.gender) = LOWER(COALESCE(:gender, p.gender)))
            AND
            (p.birth_date <= COALESCE(CAST(:minDate AS timestamp), p.birth_date))
            AND
            (p.birth_date >= COALESCE(CAST(:maxDate AS timestamp), p.birth_date))
            AND
            p.status = 'AVAILABLE'
            AND
            (COALESCE(:searchQuery, '') = '' OR
              LOWER(p.name::text) LIKE LOWER(CONCAT('%', :searchQuery, '%')) OR
              (p.description IS NOT NULL AND LOWER(p.description::text) LIKE LOWER(CONCAT('%', :searchQuery, '%'))))
            AND
            (:city IS NULL OR EXISTS (
                SELECT 1 FROM address a
                LEFT JOIN pet_address pa ON pa.address_id = a.id AND pa.pet_id = p.id
                LEFT JOIN shelter_address sa ON sa.address_id = a.id AND sa.shelter_id = p.shelter_id
                WHERE (pa.pet_id = p.id OR sa.shelter_id = p.shelter_id) AND LOWER(a.city) = LOWER(:city)
            ))
            AND
            (:country IS NULL OR EXISTS (
                SELECT 1 FROM address a
                LEFT JOIN pet_address pa ON pa.address_id = a.id AND pa.pet_id = p.id
                LEFT JOIN shelter_address sa ON sa.address_id = a.id AND sa.shelter_id = p.shelter_id
                WHERE (pa.pet_id = p.id OR sa.shelter_id = p.shelter_id) AND LOWER(a.country) = LOWER(:country)
            ))
            """, nativeQuery = true)
    long countPetsByFilters(
            @Param("species") String species,
            @Param("breed") String breed,
            @Param("gender") String gender,
            @Param("minDate") LocalDateTime minDate,
            @Param("maxDate") LocalDateTime maxDate,
            @Param("searchQuery") String searchQuery,
            @Param("city") String city,
            @Param("country") String country);

    @Query(value = """
            SELECT * FROM pet p
            WHERE p.shelter_id = :shelterId
            ORDER BY p.created_at DESC
            LIMIT :limit OFFSET :offset
            """, nativeQuery = true)
    List<Pet> findByShelterIdWithPagination(
            @Param("shelterId") UUID shelterId,
            @Param("limit") int limit,
            @Param("offset") int offset);
}