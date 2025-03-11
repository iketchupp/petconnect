package org.petconnect.backend.model;

import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "pet_image")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PetImage {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false, columnDefinition = "uuid")
    private UUID id;
    
    @Column(name = "pet_id", nullable = false, columnDefinition = "uuid")
    private UUID petId;
    
    @Column(name = "image_id", nullable = false, columnDefinition = "uuid")
    private UUID imageId;
    
    @Builder.Default
    @Column(name = "is_primary", nullable = false)
    private Boolean isPrimary = false;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    // Relationships
    @ManyToOne
    @JoinColumn(name = "pet_id", insertable = false, updatable = false)
    private Pet pet;
    
    @OneToOne
    @JoinColumn(name = "image_id", insertable = false, updatable = false)
    private Image image;
}