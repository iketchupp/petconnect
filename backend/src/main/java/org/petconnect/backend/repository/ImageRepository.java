package org.petconnect.backend.repository;

import java.util.Optional;
import java.util.UUID;

import org.petconnect.backend.model.Image;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ImageRepository extends JpaRepository<Image, UUID> {
    Optional<Image> findByKey(String key);
}
