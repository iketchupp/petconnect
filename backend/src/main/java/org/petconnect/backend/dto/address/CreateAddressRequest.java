package org.petconnect.backend.dto.address;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request to create a new address")
public class CreateAddressRequest {
    @NotBlank(message = "Address line 1 is required")
    @Schema(description = "First line of the address", example = "123 Main St", required = true)
    private String address1;

    @Schema(description = "Second line of the address (optional)", example = "Suite 100")
    private String address2;

    @NotBlank(message = "City is required")
    @Schema(description = "City", example = "San Francisco", required = true)
    private String city;

    @NotBlank(message = "Region/State is required")
    @Schema(description = "Region/State", example = "CA", required = true)
    private String region;

    @NotBlank(message = "Postal/ZIP code is required")
    @Schema(description = "Postal/ZIP code", example = "94105", required = true)
    private String postalCode;

    @NotBlank(message = "Country is required")
    @Schema(description = "Country", example = "United States", required = true)
    private String country;

    @NotNull(message = "Latitude is required")
    @Schema(description = "Latitude coordinate", example = "37.7749", required = true)
    private Double lat;

    @NotNull(message = "Longitude is required")
    @Schema(description = "Longitude coordinate", example = "-122.4194", required = true)
    private Double lng;
}