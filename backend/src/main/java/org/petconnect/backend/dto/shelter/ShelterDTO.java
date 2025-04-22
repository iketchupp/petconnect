package org.petconnect.backend.dto.shelter;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import org.petconnect.backend.dto.address.AddressDTO;
import org.petconnect.backend.model.Shelter;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Shelter information")
public class ShelterDTO {
    @Schema(description = "Unique identifier of the shelter")
    private UUID id;

    @Schema(description = "Name of the shelter")
    private String name;

    @Schema(description = "Description of the shelter")
    private String description;

    @Schema(description = "Phone number of the shelter")
    private String phone;

    @Schema(description = "Email address of the shelter")
    private String email;

    @Schema(description = "Website of the shelter")
    private String website;

    @Schema(description = "ID of the shelter owner")
    private UUID ownerId;

    @Schema(description = "URL of the shelter's avatar image")
    private String avatarUrl;

    @Schema(description = "Address information")
    private AddressDTO address;

    @Schema(description = "When the shelter was created")
    private LocalDateTime createdAt;

    public static ShelterDTO fromEntity(Shelter shelter) {
        return ShelterDTO.builder()
                .id(shelter.getId())
                .name(shelter.getName())
                .description(shelter.getDescription())
                .phone(shelter.getPhone())
                .email(shelter.getEmail())
                .website(shelter.getWebsite())
                .ownerId(shelter.getOwnerId())
                .avatarUrl(shelter.getAvatarImage() != null ? shelter.getAvatarImage().getImage().getUrl() : null)
                .address(shelter.getAddress() != null ? AddressDTO.fromEntity(shelter.getAddress()) : null)
                .createdAt(shelter.getCreatedAt())
                .build();
    }
}