package org.petconnect.backend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.persistence.*;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "bookmark")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Bookmark {

    @EmbeddedId
    private BookmarkId id;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Embeddable
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BookmarkId implements Serializable {

        @Column(name = "pet_id")
        private UUID petId;

        @Column(name = "user_id")
        private UUID userId;
    }

    //Relationships

    @ManyToOne
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "pet_id", insertable = false, updatable = false)
    private Pet pet;
}