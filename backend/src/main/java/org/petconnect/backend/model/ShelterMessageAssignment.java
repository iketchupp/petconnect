package org.petconnect.backend.model;

import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "shelter_message_assignment")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShelterMessageAssignment {
    
    @Id
    @Column(name = "message_id", columnDefinition = "uuid")
    private UUID messageId;
    
    @Column(name = "user_id", nullable = false, columnDefinition = "uuid")
    private UUID userId;
    
    @CreationTimestamp
    @Column(name = "assigned_at", nullable = false, updatable = false)
    private LocalDateTime assignedAt;
    
    // Relationships
    @OneToOne
    @JoinColumn(name = "message_id", insertable = false, updatable = false)
    private Message message;
    
    @ManyToOne
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;
}