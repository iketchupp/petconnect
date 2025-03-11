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
public class Message {

    @Id
    @Builder.Default
    private UUID id = UUID.randomUUID();

    @Column(name = "sender_id")
    private String senderId;

    @Column(name = "receiver_id")
    private String receiverId;

    private String content;

    @Column(name = "is_read")
    private boolean isRead = false;

    @Column(nullable = true, name = "shelter_id")
    private String shelterId;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    //Relationships

    @ManyToOne
    @JoinColumn(name = "sender_id", insertable = false, updatable = false)
    private User sender;

    @ManyToOne
    @JoinColumn(name = "receiver_id", insertable = false, updatable = false)
    private User receiver;

    @ManyToOne
    @JoinColumn(name = "shelter_id", nullable = true, insertable = false, updatable = false)
    private Shelter shelter;

    @OneToOne(mappedBy = "message")
    @JoinColumn(nullable = true)
    private ShelterMessageAssignment assignment;
}
