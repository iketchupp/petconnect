package org.petconnect.backend.model;

import java.time.ZonedDateTime;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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
    private ZonedDateTime createdAt;

    // Relationships
    @OneToOne
    @JoinColumn(name = "image_id", insertable = false, updatable = false)
    private Image image;

    @OneToOne(mappedBy = "avatarImage")
    private User user;

    @OneToOne(mappedBy = "avatarImage")
    private Shelter shelter;
}