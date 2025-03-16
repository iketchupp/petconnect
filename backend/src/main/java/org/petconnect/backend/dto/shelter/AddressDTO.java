package org.petconnect.backend.dto.shelter;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.petconnect.backend.model.Address;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Address information")
public class AddressDTO {
    @Schema(description = "First line of the address")
    private String address1;

    @Schema(description = "Second line of the address (optional)")
    private String address2;

    @Schema(description = "Formatted full address")
    private String formattedAddress;

    @Schema(description = "City")
    private String city;

    @Schema(description = "Region/State")
    private String region;

    @Schema(description = "Postal/ZIP code")
    private String postalCode;

    @Schema(description = "Country")
    private String country;

    @Schema(description = "Latitude coordinate")
    private Double lat;

    @Schema(description = "Longitude coordinate")
    private Double lng;

    public static AddressDTO fromEntity(Address address) {
        return AddressDTO.builder()
                .address1(address.getAddress1())
                .address2(address.getAddress2())
                .formattedAddress(address.getFormattedAddress())
                .city(address.getCity())
                .region(address.getRegion())
                .postalCode(address.getPostalCode())
                .country(address.getCountry())
                .lat(address.getLat())
                .lng(address.getLng())
                .build();
    }
}