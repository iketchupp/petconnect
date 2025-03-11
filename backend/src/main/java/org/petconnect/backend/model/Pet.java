package org.petconnect.backend.model;

import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "pet")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Pet {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false, columnDefinition = "uuid")
    private UUID id;
    
    @Column(name = "name", length = 50, nullable = false)
    private String name;
    
    @Column(name = "description")
    private String description;
    
    @Column(name = "species", length = 50, nullable = false)
    private String species;
    
    @Column(name = "breed", length = 50, nullable = false)
    private String breed;
    
    @Column(name = "gender", length = 50, nullable = false)
    private String gender;
    
    @Column(name = "birth_date", nullable = false)
    private LocalDateTime birthDate;
    
    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private PetStatus status = PetStatus.AVAILABLE;
    
    @Column(name = "created_by_user_id", columnDefinition = "uuid")
    private UUID createdByUserId;
    
    @Column(name = "shelter_id", columnDefinition = "uuid")
    private UUID shelterId;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    // Relationships
    @ManyToOne
    @JoinColumn(name = "created_by_user_id", insertable = false, updatable = false)
    private User creator;
    
    @ManyToOne
    @JoinColumn(name = "shelter_id", insertable = false, updatable = false)
    private Shelter shelter;
    
    @OneToMany(mappedBy = "pet", cascade = CascadeType.ALL)
    @Builder.Default
    private List<PetImage> petImages = new ArrayList<>();
    
    @OneToMany(mappedBy = "pet", cascade = CascadeType.ALL)
    @Builder.Default
    private List<Bookmark> bookmarks = new ArrayList<>();
} 