package org.petconnect.backend.model;

import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.*;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "shelter_member")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@IdClass(ShelterMember.ShelterMemberId.class)
public class ShelterMember {
    
    @Id
    @Column(name = "shelter_id", columnDefinition = "uuid")
    private UUID shelterId;
    
    @Id
    @Column(name = "user_id", columnDefinition = "uuid")
    private UUID userId;
    
    @CreationTimestamp
    @Column(name = "joined_at", nullable = false, updatable = false)
    private LocalDateTime joinedAt;
    
    // Relationships
    @ManyToOne
    @JoinColumn(name = "shelter_id", insertable = false, updatable = false)
    private Shelter shelter;
    
    @ManyToOne
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ShelterMemberId implements Serializable {
        private UUID shelterId;
        private UUID userId;
    }
}