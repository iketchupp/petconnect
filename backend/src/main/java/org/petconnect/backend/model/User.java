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
@Table(name = "user")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @Builder.Default
    private UUID id = UUID.randomUUID();

    @Column(length = 100, name = "first_name")
    private String firstName;

    @Column(length = 100, name = "last_name")
    private String lastName;

    @Column(unique = true, length = 50)
    private String username; // ?

    @Column(unique = true, length = 100)
    private String email;

    @Column(name = "password_hash", length = 255)
    private String passwordHash;

    @Column(nullable = true, name = "avatar_image_id")
    private String avatarImageId;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    // Relationships

    @OneToOne
    @JoinColumn(name = "avatar_image_id", nullable = true, insertable = false, updatable = false)
    private AvatarImage avatarImage;

    @OneToMany(mappedBy = "owner")
    private List<Shelter> ownedShelters = new ArrayList<>();

    @OneToMany(mappedBy = "user")
    private List<ShelterMember> memberships = new ArrayList<>();

    @OneToMany(mappedBy = "creator")
    private List<Pet> createdPets = new ArrayList<>();

    @OneToMany(mappedBy = "user")
    private List<Bookmark> bookmarks = new ArrayList<>();

    @OneToMany(mappedBy = "sender")
    private List<Message> sentMessages = new ArrayList<>();

    @OneToMany(mappedBy = "receiver")
    private List<Message> receivedMessages = new ArrayList<>();

    @OneToMany(mappedBy = "user")
    private List<ShelterMessageAssignment> messageAssignments = new ArrayList<>();

}

