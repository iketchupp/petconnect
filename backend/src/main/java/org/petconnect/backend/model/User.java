package org.petconnect.backend.model;

import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "user")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false, columnDefinition = "uuid")
    private UUID id;
    
    @Column(name = "first_name", length = 100, nullable = false)
    private String firstName;
    
    @Column(name = "last_name", length = 100, nullable = false)
    private String lastName;
    
    @Column(name = "username", length = 50, nullable = false, unique = true)
    private String username;
    
    @Column(name = "email", length = 100, nullable = false, unique = true)
    private String email;
    
    @Column(name = "password_hash", length = 255, nullable = false)
    private String passwordHash;
    
    @Column(name = "avatar_image_id", columnDefinition = "uuid")
    private UUID avatarImageId;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    // Relationships
    @OneToOne
    @JoinColumn(name = "avatar_image_id", insertable = false, updatable = false)
    private AvatarImage avatarImage;
    
    @OneToMany(mappedBy = "owner", cascade = CascadeType.ALL)
    @Builder.Default
    private List<Shelter> ownedShelters = new ArrayList<>();
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    @Builder.Default
    private List<ShelterMember> memberships = new ArrayList<>();
    
    @OneToMany(mappedBy = "creator", cascade = CascadeType.ALL)
    @Builder.Default
    private List<Pet> createdPets = new ArrayList<>();
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    @Builder.Default
    private List<Bookmark> bookmarks = new ArrayList<>();
    
    @OneToMany(mappedBy = "sender", cascade = CascadeType.ALL)
    @Builder.Default
    private List<Message> sentMessages = new ArrayList<>();
    
    @OneToMany(mappedBy = "receiver", cascade = CascadeType.ALL)
    @Builder.Default
    private List<Message> receivedMessages = new ArrayList<>();
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    @Builder.Default
    private List<ShelterMessageAssignment> messageAssignments = new ArrayList<>();
} 