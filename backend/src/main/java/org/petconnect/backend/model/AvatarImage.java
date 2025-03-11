package org.petconnect.backend.model;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "avatar_image")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AvatarImage {

    @Id
    @Builder.Default
    private UUID id = UUID.randomUUID();

    @Column(unique = true,name = "image_id")
    private String imageId;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    //Relationships

    @OneToMany
    @JoinColumn(name = "image_id", insertable = false, updatable = false)
    private List<Image> images;

    @OneToOne(mappedBy = "avatarImage")
    @JoinColumn(nullable = true)
    private User user;

    @OneToOne(mappedBy = "avatarImage")
    @JoinColumn(nullable = true)
    private Shelter shelter;
}
