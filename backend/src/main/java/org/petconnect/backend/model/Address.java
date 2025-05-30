package org.petconnect.backend.model;

import java.time.ZonedDateTime;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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
    private ZonedDateTime createdAt;
}