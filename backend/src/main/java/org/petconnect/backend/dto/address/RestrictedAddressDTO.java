package org.petconnect.backend.dto.address;

import org.petconnect.backend.model.Address;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Restricted address information (only city and country)")
public class RestrictedAddressDTO {
    @Schema(description = "City")
    private String city;

    @Schema(description = "Country")
    private String country;

    @Schema(description = "Formatted address")
    private String formattedAddress;

    @Schema(description = "Latitude coordinate")
    private Double lat;

    @Schema(description = "Longitude coordinate")
    private Double lng;

    public static RestrictedAddressDTO fromEntity(Address address) {
        return RestrictedAddressDTO.builder()
                .city(address.getCity())
                .country(address.getCountry())
                .formattedAddress(address.getCity() + ", " + address.getCountry())
                .lat(address.getLat())
                .lng(address.getLng())
                .build();
    }
}