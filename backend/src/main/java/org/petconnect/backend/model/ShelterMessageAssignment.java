package org.petconnect.backend.model;

import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "message")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShelterMessageAssignment {

    @Id
    @Builder.Default
    @Column(name = "message_id")
    private UUID messageId = UUID.randomUUID();

    @Column(name = "user_id")
    private String userId;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime assignedAt = LocalDateTime.now();

    //Relationships

    @OneToOne
    @JoinColumn(name = "message_id", insertable = false, updatable = false)
    private Message message;

    @ManyToOne
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;

}
