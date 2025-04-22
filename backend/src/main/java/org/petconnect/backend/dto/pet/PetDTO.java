package org.petconnect.backend.dto.pet;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.petconnect.backend.dto.address.AddressDTO;
import org.petconnect.backend.model.Pet;
import org.petconnect.backend.model.PetStatus;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Pet information")
public class PetDTO {
    @Schema(description = "Unique identifier of the pet", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID id;

    @Schema(description = "Name of the pet", example = "Max")
    private String name;

    @Schema(description = "Description of the pet", example = "A friendly and energetic dog looking for a loving home")
    private String description;

    @Schema(description = "Species of the pet", example = "Dog")
    private String species;

    @Schema(description = "Breed of the pet", example = "Golden Retriever")
    private String breed;

    @Schema(description = "Gender of the pet", example = "Male")
    private String gender;

    @Schema(description = "Birth date of the pet", example = "2021-01-02")
    private LocalDate birthDate;

    @Schema(description = "Current status of the pet", example = "AVAILABLE")
    private PetStatus status;

    @Schema(description = "ID of the shelter where the pet is located", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID shelterId;

    @Schema(description = "Name of the shelter where the pet is located", example = "Happy Paws Shelter")
    private String shelterName;

    @Schema(description = "When the pet was added to the system")
    private LocalDateTime createdAt;

    @Schema(description = "List of URLs to the pet's images")
    private List<String> imageUrls;

    @Schema(description = "Address information (only present for user pets)")
    private AddressDTO address;

    public static PetDTO fromEntity(Pet pet) {
        return PetDTO.builder()
                .id(pet.getId())
                .name(pet.getName())
                .description(pet.getDescription())
                .species(pet.getSpecies())
                .breed(pet.getBreed())
                .gender(pet.getGender())
                .birthDate(pet.getBirthDate())
                .status(pet.getStatus())
                .shelterId(pet.getShelterId())
                .shelterName(pet.getShelter() != null ? pet.getShelter().getName() : null)
                .createdAt(pet.getCreatedAt())
                .imageUrls(pet.getPetImages().stream()
                        .map(image -> image.getImage().getUrl())
                        .collect(Collectors.toList()))
                .address(pet.getAddress() != null ? AddressDTO.fromEntity(pet.getAddress()) : null)
                .build();
    }
}