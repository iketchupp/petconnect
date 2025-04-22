package org.petconnect.backend.repository;

import java.util.Optional;
import java.util.UUID;

import org.petconnect.backend.model.ShelterAddress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ShelterAddressRepository extends JpaRepository<ShelterAddress, UUID> {
    Optional<ShelterAddress> findByShelterId(UUID shelterId);
}