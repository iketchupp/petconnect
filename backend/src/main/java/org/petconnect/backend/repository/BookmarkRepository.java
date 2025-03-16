package org.petconnect.backend.repository;

import org.petconnect.backend.model.Bookmark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface BookmarkRepository extends JpaRepository<Bookmark, Bookmark.BookmarkId> {
    @Query("SELECT b FROM Bookmark b JOIN FETCH b.pet WHERE b.userId = :userId ORDER BY b.createdAt DESC")
    List<Bookmark> findByUserIdOrderByCreatedAtDesc(@Param("userId") UUID userId);
}