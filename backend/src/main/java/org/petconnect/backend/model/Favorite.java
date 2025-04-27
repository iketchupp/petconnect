package org.petconnect.backend.model;

import java.io.Serializable;
import java.time.ZonedDateTime;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "favorite")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@IdClass(Favorite.FavoriteId.class)
public class Favorite {

    @Id
    @Column(name = "user_id", columnDefinition = "uuid")
    private UUID userId;

    @Id
    @Column(name = "pet_id", columnDefinition = "uuid")
    private UUID petId;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private ZonedDateTime createdAt;

    // Relationships
    @ManyToOne
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "pet_id", insertable = false, updatable = false)
    private Pet pet;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FavoriteId implements Serializable {
        private UUID userId;
        private UUID petId;
    }
}