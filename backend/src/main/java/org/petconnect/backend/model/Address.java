package org.petconnect.backend.model;

import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "address")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Address {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false, columnDefinition = "uuid")
    private UUID id;
    
    @Column(name = "shelter_id", columnDefinition = "uuid")
    private UUID shelterId;
    
    @Column(name = "address1", length = 255, nullable = false)
    private String address1;
    
    @Column(name = "address2", length = 255)
    private String address2;
    
    @Column(name = "formatted_address", length = 255, nullable = false)
    private String formattedAddress;
    
    @Column(name = "city", length = 100, nullable = false)
    private String city;
    
    @Column(name = "region", length = 100, nullable = false)
    private String region;
    
    @Column(name = "postal_code", length = 20, nullable = false)
    private String postalCode;
    
    @Column(name = "country", length = 100, nullable = false)
    private String country;
    
    @Column(name = "lat", nullable = false)
    private Double lat;
    
    @Column(name = "lng", nullable = false)
    private Double lng;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    // Relationships
    @OneToOne
    @JoinColumn(name = "shelter_id", insertable = false, updatable = false)
    private Shelter shelters;
}