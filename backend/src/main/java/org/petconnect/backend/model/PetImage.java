package org.petconnect.backend.model;

import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.*;
import org.hibernate.annotations.Collate;
import org.hibernate.annotations.CreationTimestamp;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "pet_image")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PetImage {

    @Id
    @Builder.Default
    private UUID id = UUID.randomUUID();

    @Column(name = "pet_id")
    private String petId;

    @Column(unique = true, name = "image_id")
    private String imageId;

    @Column(name = "is_primary")
    private boolean isPrimary = false;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    //Relationship

    @ManyToOne
    @JoinColumn(name = "pet_id", insertable = false, updatable = false)
    private Pet pet;

    @OneToOne
    @JoinColumn(name = "image_id", insertable = false, updatable = false)
    private Image image;
}
