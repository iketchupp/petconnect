package org.petconnect.backend.repository;

import java.util.List;
import java.util.UUID;

import org.petconnect.backend.model.Favorite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Favorite.FavoriteId> {
    @Query("SELECT f FROM Favorite f JOIN FETCH f.pet WHERE f.userId = :userId ORDER BY f.createdAt DESC")
    List<Favorite> findByUserIdOrderByCreatedAtDesc(@Param("userId") UUID userId);

    @Query("SELECT COUNT(f) FROM Favorite f WHERE f.userId = :userId")
    long countByUserId(@Param("userId") UUID userId);

    @Query(value = "SELECT * FROM (SELECT f.*, ROW_NUMBER() OVER (ORDER BY f.created_at DESC) AS rn FROM favorite f WHERE f.user_id = :userId) AS ranked WHERE rn > :offset AND rn <= :offset + :limit", nativeQuery = true)
    List<Favorite> findByUserIdWithPagination(
            @Param("userId") UUID userId,
            @Param("offset") int offset,
            @Param("limit") int limit);
}