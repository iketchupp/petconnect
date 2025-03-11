package org.petconnect.backend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.persistence.*;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "shelter_member")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ShelterMember {

    @EmbeddedId
    private ShelterMemberId id;

    @Column(name = "joined_at", nullable = false)
    private LocalDateTime joinedAt = LocalDateTime.now();

    @Embeddable
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ShelterMemberId implements Serializable {

        @Column(name = "shelter_id")
        private UUID shelterId;

        @Column(name = "user_id")
        private UUID userId;
    }

    // Relationships

    @ManyToOne
    @JoinColumn(name = "shelter_id", insertable = false, updatable = false)
    private Shelter shelter;

    @ManyToOne
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;
}