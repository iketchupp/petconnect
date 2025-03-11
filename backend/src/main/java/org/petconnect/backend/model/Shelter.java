package org.petconnect.backend.model;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "shelter")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Shelter {

    @Id
    @Builder.Default
    private UUID id = UUID.randomUUID();

    @Column(length = 100)
    private String name;

    @Column(nullable = true)
    private String description;

    @Column(nullable = true)
    private String phoneNumber;

    @Column(nullable = true)
    private String email;

    @Column(nullable = true)
    private String website;

    @Column(name = "owner_id")
    private String ownerId;

    @Column(unique = true, name = "avatar_image_id", nullable = true)
    private String avatarImageId;

    @Column(name = "address_id", nullable = true)
    private String addressId;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    // Relationships

    @ManyToOne
    @JoinColumn(name = "owner_id",insertable = false, updatable = false)
    private User owner;

    @OneToOne
    @JoinColumn(name = "avatar_image_id", nullable = true, insertable = false, updatable = false)
    private AvatarImage avatarImage;

    @OneToOne(mappedBy = "shelters")
    @JoinColumn(nullable = false)
    private Address address;

    @OneToMany(mappedBy = "shelter")
    private List<ShelterMember> members;

    @OneToMany(mappedBy = "shelter")
    private List<Pet> pets;

    @OneToMany(mappedBy = "shelter")
    private List<Message> messages;
}


