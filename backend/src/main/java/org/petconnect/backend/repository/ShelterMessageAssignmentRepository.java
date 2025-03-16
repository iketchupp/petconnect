package org.petconnect.backend.repository;

import org.petconnect.backend.model.ShelterMessageAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ShelterMessageAssignmentRepository extends JpaRepository<ShelterMessageAssignment, UUID> {
} 