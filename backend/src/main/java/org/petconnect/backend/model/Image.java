package org.petconnect.backend.model;

import java.math.BigInteger;
import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "image")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Image {

    @Id
    @Builder.Default
    private UUID id = UUID.randomUUID();

    @Column(length = 255)
    private String url;

    @Column(unique = true,length = 255)
    private String key;

    @Column(length = 100)
    private String bucket;

    @Column(length = 50)
    private String fileType;

    @Column(name = "file_size")
    private BigInteger fileSize;

    @CreationTimestamp
    @Column(name = "uploaded_at")
    private LocalDateTime uploadedAt = LocalDateTime.now();

    //Relationships

    @ManyToOne
    @JoinColumn(nullable = true)
    private AvatarImage avatarImage;

    @OneToOne(mappedBy = "image")
    @JoinColumn(nullable = true)
    private PetImage petImage;
}
