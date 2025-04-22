package org.petconnect.backend.repository;

import java.util.Optional;
import java.util.UUID;

import org.petconnect.backend.model.PetAddress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PetAddressRepository extends JpaRepository<PetAddress, UUID> {
    Optional<PetAddress> findByPetId(UUID petId);
}