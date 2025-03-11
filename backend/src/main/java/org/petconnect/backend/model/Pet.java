package org.petconnect.backend.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "pet")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Pet {

    @Id
    @Builder.Default
    private UUID id = UUID.randomUUID();

    @Column(length = 50)
    private String name;

    @Column(nullable = true)
    private String description;

    @Column(length = 50)
    private String species;

    @Column(length = 50)
    private String breed;

    @Column(length = 50)
    private String gender;

    private LocalDateTime birthDate;

    private PetStatus status = PetStatus.AVALIABLE;

    @Column(name = "created_by_user_id", nullable = true)
    private String createdByUserId;

    @Column(name = "shelter_id", nullable = true)
    private String shelterId;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    //Relationships

    @ManyToOne
    @JoinColumn(name = "created_by_user_id", nullable = true, insertable = false, updatable = false)
    private User creator;

    @ManyToOne
    @JoinColumn(name = "shelter_id", nullable = true, insertable = false, updatable = false)
    private Shelter shelter;

    @OneToMany(mappedBy = "pet")
    private List<PetImage> petImages = new ArrayList<>();

    @OneToMany(mappedBy = "pet")
    private List<Bookmark> bookmarks = new ArrayList<>();

}
