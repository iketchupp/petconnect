package org.petconnect.backend.dto.pet;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request to create a new pet")
public class CreatePetRequest {
    @NotBlank(message = "Name is required")
    @Size(max = 50, message = "Name must be at most 50 characters")
    @Schema(description = "Name of the pet", example = "Max", maxLength = 50, required = true)
    private String name;
    
    @Size(max = 1000, message = "Description must be at most 1000 characters")
    @Schema(description = "Description of the pet", example = "A friendly and energetic dog looking for a loving home", maxLength = 1000)
    private String description;
    
    @NotBlank(message = "Species is required")
    @Size(max = 50, message = "Species must be at most 50 characters")
    @Schema(description = "Species of the pet", example = "Dog", maxLength = 50, required = true)
    private String species;
    
    @NotBlank(message = "Breed is required")
    @Size(max = 50, message = "Breed must be at most 50 characters")
    @Schema(description = "Breed of the pet", example = "Golden Retriever", maxLength = 50, required = true)
    private String breed;
    
    @NotBlank(message = "Gender is required")
    @Size(max = 50, message = "Gender must be at most 50 characters")
    @Schema(description = "Gender of the pet", example = "Male", maxLength = 50, required = true)
    private String gender;
    
    @NotNull(message = "Birth date is required")
    @Schema(description = "Birth date of the pet", example = "2021-01-02", required = true, pattern = "yyyy-MM-dd or yyyy.MM.dd")
    private LocalDate birthDate;
    
    @Schema(description = "ID of the shelter where the pet will be located", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID shelterId;
} 