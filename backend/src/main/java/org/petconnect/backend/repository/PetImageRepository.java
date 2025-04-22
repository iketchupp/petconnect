package org.petconnect.backend.repository;

import java.util.UUID;

import org.petconnect.backend.model.PetImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PetImageRepository extends JpaRepository<PetImage, UUID> {
}