package org.petconnect.backend.model;

import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Table(name = "shelter")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = { "owner", "avatarImage", "shelterAddress", "pets", "messages" })
@EqualsAndHashCode(exclude = { "owner", "avatarImage", "shelterAddress", "pets", "messages" })
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

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private ZonedDateTime createdAt;

    // Relationships
    @ManyToOne
    @JoinColumn(name = "owner_id", insertable = false, updatable = false)
    private User owner;

    @OneToOne
    @JoinColumn(name = "avatar_image_id", insertable = false, updatable = false)
    private AvatarImage avatarImage;

    @OneToOne(mappedBy = "shelter", cascade = CascadeType.ALL, orphanRemoval = true)
    private ShelterAddress shelterAddress;

    @OneToMany(mappedBy = "shelter", cascade = CascadeType.ALL)
    @Builder.Default
    private List<Pet> pets = new ArrayList<>();

    @OneToMany(mappedBy = "shelter", cascade = CascadeType.ALL)
    @Builder.Default
    private List<Message> messages = new ArrayList<>();

    public Address getAddress() {
        return shelterAddress != null ? shelterAddress.getAddress() : null;
    }
}