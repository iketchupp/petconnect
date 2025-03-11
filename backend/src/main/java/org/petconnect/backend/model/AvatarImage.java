package org.petconnect.backend.model;

import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "avatar_image")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AvatarImage {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false, columnDefinition = "uuid")
    private UUID id;
    
    @Column(name = "image_id", nullable = false, columnDefinition = "uuid")
    private UUID imageId;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    // Relationships
    @OneToOne
    @JoinColumn(name = "image_id", insertable = false, updatable = false)
    private Image image;
    
    @OneToOne(mappedBy = "avatarImage")
    private User user;
    
    @OneToOne(mappedBy = "avatarImage")
    private Shelter shelter;
} 