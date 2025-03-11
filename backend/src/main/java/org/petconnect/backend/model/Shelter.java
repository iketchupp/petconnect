package org.petconnect.backend.model;

import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "shelter")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Shelter {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false, columnDefinition = "uuid")
    private UUID id;
    
    @Column(name = "name", length = 100, nullable = false)
    private String name;
    
    @Column(name = "description")
    private String description;
    
    @Column(name = "phone")
    private String phone;
    
    @Column(name = "email")
    private String email;
    
    @Column(name = "website")
    private String website;
    
    @Column(name = "owner_id", nullable = false, columnDefinition = "uuid")
    private UUID ownerId;
    
    @Column(name = "avatar_image_id", columnDefinition = "uuid")
    private UUID avatarImageId;
    
    @Column(name = "address_id", columnDefinition = "uuid")
    private UUID addressId;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    // Relationships
    @ManyToOne
    @JoinColumn(name = "owner_id", insertable = false, updatable = false)
    private User owner;
    
    @OneToOne
    @JoinColumn(name = "avatar_image_id", insertable = false, updatable = false)
    private AvatarImage avatarImage;
    
    @OneToOne(mappedBy = "shelters", cascade = CascadeType.ALL)
    private Address address;
    
    @OneToMany(mappedBy = "shelter", cascade = CascadeType.ALL)
    @Builder.Default
    private List<ShelterMember> members = new ArrayList<>();
    
    @OneToMany(mappedBy = "shelter", cascade = CascadeType.ALL)
    @Builder.Default
    private List<Pet> pets = new ArrayList<>();
    
    @OneToMany(mappedBy = "shelter", cascade = CascadeType.ALL)
    @Builder.Default
    private List<Message> messages = new ArrayList<>();
}