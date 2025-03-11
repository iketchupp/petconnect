package org.petconnect.backend.model;

import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.*;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "bookmark")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@IdClass(Bookmark.BookmarkId.class)
public class Bookmark {
    
    @Id
    @Column(name = "user_id", columnDefinition = "uuid")
    private UUID userId;
    
    @Id
    @Column(name = "pet_id", columnDefinition = "uuid")
    private UUID petId;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
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
    public static class BookmarkId implements Serializable {
        private UUID userId;
        private UUID petId;
    }
}