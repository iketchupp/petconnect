package org.petconnect.backend.repository;

import org.petconnect.backend.model.Pet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface PetRepository extends JpaRepository<Pet, UUID> {

    @Query(value = """
            SELECT * FROM pet p
            WHERE
            (COALESCE(:species, p.species) IS NULL OR LOWER(p.species) = LOWER(COALESCE(:species, p.species)))
            AND
            (COALESCE(:breed, p.breed) IS NULL OR LOWER(p.breed) = LOWER(COALESCE(:breed, p.breed)))
            AND
            (COALESCE(:gender, p.gender) = p.gender)
            AND
            (p.birth_date <= COALESCE(CAST(:minDate AS timestamp), p.birth_date))
            AND
            p.status = 'AVAILABLE'
            AND
            (COALESCE(:searchQuery, '') = '' OR
              LOWER(p.name::text) LIKE LOWER(CONCAT('%', :searchQuery, '%')) OR
              (p.description IS NOT NULL AND LOWER(p.description::text) LIKE LOWER(CONCAT('%', :searchQuery, '%'))))
            ORDER BY
            CASE
                WHEN COALESCE(:sortBy, 'newest') = 'newest' THEN p.created_at
            END DESC NULLS LAST,
            CASE
                WHEN :sortBy = 'oldest' THEN p.created_at
            END ASC NULLS LAST,
            CASE
                WHEN :sortBy = 'name' THEN p.name
            END ASC NULLS LAST,
            p.id DESC
            LIMIT :limit OFFSET :offset
            """, nativeQuery = true)
    List<Pet> findPetsByFilters(
            @Param("species") String species,
            @Param("breed") String breed,
            @Param("gender") String gender,
            @Param("minDate") LocalDateTime minDate,
            @Param("searchQuery") String searchQuery,
            @Param("sortBy") String sortBy,
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

    @Query("SELECT DISTINCT p.gender FROM Pet p ORDER BY p.gender")
    List<String> findAllGenders();

    List<Pet> findByShelterIdOrderByCreatedAtDesc(UUID shelterId);

    @Query(value = """
            SELECT COUNT(*) FROM pet p
            WHERE
            (COALESCE(:species, p.species) IS NULL OR LOWER(p.species) = LOWER(COALESCE(:species, p.species)))
            AND
            (COALESCE(:breed, p.breed) IS NULL OR LOWER(p.breed) = LOWER(COALESCE(:breed, p.breed)))
            AND
            (COALESCE(:gender, p.gender) = p.gender)
            AND
            (p.birth_date <= COALESCE(CAST(:minDate AS timestamp), p.birth_date))
            AND
            p.status = 'AVAILABLE'
            AND
            (COALESCE(:searchQuery, '') = '' OR
              LOWER(p.name::text) LIKE LOWER(CONCAT('%', :searchQuery, '%')) OR
              (p.description IS NOT NULL AND LOWER(p.description::text) LIKE LOWER(CONCAT('%', :searchQuery, '%'))))
            """, nativeQuery = true)
    long countPetsByFilters(
            @Param("species") String species,
            @Param("breed") String breed,
            @Param("gender") String gender,
            @Param("minDate") LocalDateTime minDate,
            @Param("searchQuery") String searchQuery);
}