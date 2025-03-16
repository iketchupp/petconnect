package org.petconnect.backend.dto.shelter;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request to create a new shelter")
public class CreateShelterRequest {
    @NotBlank(message = "Name is required")
    @Size(max = 100, message = "Name must be at most 100 characters")
    @Schema(description = "Name of the shelter", example = "Happy Paws Shelter", required = true)
    private String name;

    @Schema(description = "Description of the shelter", example = "A loving shelter for pets in need")
    private String description;

    @Schema(description = "Phone number of the shelter", example = "+1-555-123-4567")
    private String phone;

    @Email(message = "Invalid email format")
    @Schema(description = "Email address of the shelter", example = "contact@happypaws.com")
    private String email;

    @Schema(description = "Website of the shelter", example = "www.happypaws.com")
    private String website;

    @Schema(description = "Address information")
    private CreateAddressRequest address;
}