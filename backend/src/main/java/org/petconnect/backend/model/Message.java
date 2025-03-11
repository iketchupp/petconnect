package org.petconnect.backend.model;

import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "message")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Message {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false, columnDefinition = "uuid")
    private UUID id;
    
    @Column(name = "sender_id", nullable = false, columnDefinition = "uuid")
    private UUID senderId;
    
    @Column(name = "receiver_id", nullable = false, columnDefinition = "uuid")
    private UUID receiverId;
    
    @Column(name = "content", nullable = false)
    private String content;
    
    @Builder.Default
    @Column(name = "is_read", nullable = false)
    private Boolean isRead = false;
    
    @Column(name = "shelter_id", columnDefinition = "uuid")
    private UUID shelterId;
    
    @CreationTimestamp
    @Column(name = "sent_at", nullable = false, updatable = false)
    private LocalDateTime sentAt;
    
    // Relationships
    @ManyToOne
    @JoinColumn(name = "sender_id", insertable = false, updatable = false)
    private User sender;
    
    @ManyToOne
    @JoinColumn(name = "receiver_id", insertable = false, updatable = false)
    private User receiver;
    
    @ManyToOne
    @JoinColumn(name = "shelter_id", insertable = false, updatable = false)
    private Shelter shelter;
    
    @OneToOne(mappedBy = "message", cascade = CascadeType.ALL)
    private ShelterMessageAssignment assignment;
}