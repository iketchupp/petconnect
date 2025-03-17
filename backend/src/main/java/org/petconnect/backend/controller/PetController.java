package org.petconnect.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.petconnect.backend.dto.pet.CreatePetRequest;
import org.petconnect.backend.dto.pet.PetDTO;
import org.petconnect.backend.dto.pet.PetFilters;
import org.petconnect.backend.dto.pet.PetsResponse;
import org.petconnect.backend.dto.user.UserDTO;
import org.petconnect.backend.service.PetService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/pets")
@RequiredArgsConstructor
@Tag(name = "Pets", description = "Endpoints for managing pets")
public class PetController {

    private final PetService petService;

    @Operation(summary = "Get pets", description = "Retrieves a paginated list of pets with optional filtering and sorting")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved pets")
    })
    @GetMapping
    public ResponseEntity<PetsResponse> getPets(
            @Parameter(description = "Pagination cursor") @RequestParam(required = false) String cursor,
            @Parameter(description = "Filter by species") @RequestParam(required = false) String species,
            @Parameter(description = "Filter by breed") @RequestParam(required = false) String breed,
            @Parameter(description = "Filter by age") @RequestParam(required = false) String age,
            @Parameter(description = "Filter by gender") @RequestParam(required = false) String gender,
            @Parameter(description = "Search query") @RequestParam(required = false) String search,
            @Parameter(description = "Sort field") @RequestParam(required = false) String sortBy,
            @Parameter(description = "Number of items per page") @RequestParam(required = false, defaultValue = "12") Integer limit) {
        // Build filters from request params
        PetFilters filters = PetFilters.builder()
                .species(species)
                .breed(breed)
                .age(age)
                .gender(gender)
                .searchQuery(search)
                .sortBy(sortBy)
                .build();

        // Get pets with pagination and filters
        PetsResponse response = petService.getPets(cursor, filters, limit);

        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Get all species", description = "Retrieves a list of all available pet species")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved species list")
    })
    @GetMapping("/species")
    public ResponseEntity<List<String>> getAllSpecies() {
        return ResponseEntity.ok(petService.getAllSpecies());
    }

    @Operation(summary = "Get breeds by species", description = "Retrieves a list of breeds for a specific species")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved breeds list"),
            @ApiResponse(responseCode = "400", description = "Invalid species provided")
    })
    @GetMapping("/breeds")
    public ResponseEntity<List<String>> getBreedsBySpecies(
            @Parameter(description = "Species name", required = true) @RequestParam String species) {
        return ResponseEntity.ok(petService.getBreedsBySpecies(species));
    }

    @Operation(summary = "Get all genders", description = "Retrieves a list of all available pet genders")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved genders list")
    })
    @GetMapping("/genders")
    public ResponseEntity<List<String>> getAllGenders() {
        return ResponseEntity.ok(petService.getAllGenders());
    }

    @Operation(summary = "Get pet by ID", description = "Retrieves a specific pet by its ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved pet"),
            @ApiResponse(responseCode = "404", description = "Pet not found")
    })
    @GetMapping("/{id}")
    public ResponseEntity<PetDTO> getPetById(
            @Parameter(description = "ID of the pet", required = true) @PathVariable UUID id) {
        return ResponseEntity.ok(petService.getPetById(id));
    }

    @Operation(summary = "Create a new pet", description = "Creates a new pet listing")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully created pet"),
            @ApiResponse(responseCode = "400", description = "Invalid input data"),
            @ApiResponse(responseCode = "401", description = "Not authenticated")
    })
    @SecurityRequirement(name = "bearerAuth")
    @PostMapping
    public ResponseEntity<PetDTO> createPet(@Valid @RequestBody CreatePetRequest request) {
        return ResponseEntity.ok(petService.createPet(request));
    }

    @Operation(summary = "Upload pet images", description = "Upload one or more images for a pet. The first image will be set as primary if no primary image exists.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully uploaded images"),
            @ApiResponse(responseCode = "400", description = "Invalid input data"),
            @ApiResponse(responseCode = "401", description = "Not authenticated"),
            @ApiResponse(responseCode = "404", description = "Pet not found")
    })
    @SecurityRequirement(name = "bearerAuth")
    @PostMapping(value = "/{petId}/images", consumes = "multipart/form-data")
    public ResponseEntity<PetDTO> uploadPetImages(
            @Parameter(description = "ID of the pet", required = true) @PathVariable UUID petId,
            @Parameter(description = "Image files to upload", required = true) @RequestParam("files") List<MultipartFile> files) {
        return ResponseEntity.ok(petService.uploadPetImages(petId, files));
    }

    @Operation(summary = "Get pet owner", description = "Retrieves the owner details for a specific pet")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved pet owner"),
            @ApiResponse(responseCode = "404", description = "Pet not found")
    })
    @GetMapping("/{petId}/owner")
    public ResponseEntity<UserDTO> getPetOwner(
            @Parameter(description = "ID of the pet", required = true) @PathVariable UUID petId) {
        return ResponseEntity.ok(petService.getPetOwner(petId));
    }

    @Operation(summary = "Delete a pet", description = "Deletes a pet and its associated images. Only the pet owner or shelter members can delete the pet.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Successfully deleted pet"),
            @ApiResponse(responseCode = "401", description = "Not authenticated"),
            @ApiResponse(responseCode = "403", description = "Not authorized to delete this pet"),
            @ApiResponse(responseCode = "404", description = "Pet not found")
    })
    @SecurityRequirement(name = "bearerAuth")
    @DeleteMapping("/{petId}")
    public ResponseEntity<Void> deletePet(
            @Parameter(description = "ID of the pet", required = true) @PathVariable UUID petId) {
        petService.deletePet(petId);
        return ResponseEntity.noContent().build();
    }
}