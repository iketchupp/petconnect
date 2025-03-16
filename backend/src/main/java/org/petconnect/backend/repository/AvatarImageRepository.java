package org.petconnect.backend.repository;

import org.petconnect.backend.model.AvatarImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface AvatarImageRepository extends JpaRepository<AvatarImage, UUID> {
} 