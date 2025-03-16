package org.petconnect.backend.repository;

import org.petconnect.backend.model.ShelterMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ShelterMemberRepository extends JpaRepository<ShelterMember, ShelterMember.ShelterMemberId> {
} 