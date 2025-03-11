package org.petconnect.backend.model;

import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "address")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Address { // ?

    @Id
    @Builder.Default
    private UUID id = UUID.randomUUID();

    @Column(nullable = false, unique = true)
    private String shelterId;

    @Column(length = 255)
    private String address1;

    @Column(length = 255, nullable = false)
    private String address2;

    @Column(length = 255)
    private String formatedAddress;

    @Column(length = 100)
    private String city;

    @Column(length = 100)
    private String region;

    @Column(length = 20)
    private String postalCode;

    @Column(length = 100)
    private String country;

    private Float latitude;

    private Float longitude;


    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();


    // Relationships

    @OneToOne
    @JoinColumn(name = "shelter_id", nullable = true, insertable = false, updatable = false)
    private Shelter shelters;

}
