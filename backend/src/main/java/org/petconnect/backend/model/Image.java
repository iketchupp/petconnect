package org.petconnect.backend.model;

import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "image")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"avatarImage", "petImage"})
@EqualsAndHashCode(exclude = {"avatarImage", "petImage"})
public class Image {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false, columnDefinition = "uuid")
    private UUID id;
    
    @Column(name = "url", length = 255, nullable = false)
    private String url;
    
    @Column(name = "key", length = 255, nullable = false, unique = true)
    private String key;
    
    @Column(name = "bucket", length = 100, nullable = false)
    private String bucket;
    
    @Column(name = "file_type", length = 50, nullable = false)
    private String fileType;
    
    @Column(name = "file_size", nullable = false)
    private Long fileSize;
    
    @CreationTimestamp
    @Column(name = "uploaded_at", nullable = false, updatable = false)
    private LocalDateTime uploadedAt;
    
    // Relationships
    @OneToOne(mappedBy = "image", cascade = CascadeType.ALL, orphanRemoval = true)
    private AvatarImage avatarImage;
    
    @OneToOne(mappedBy = "image", cascade = CascadeType.ALL, orphanRemoval = true)
    private PetImage petImage;
} 