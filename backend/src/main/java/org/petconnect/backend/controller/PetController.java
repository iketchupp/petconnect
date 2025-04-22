package org.petconnect.backend.controller;

import java.util.List;
import java.util.UUID;

import org.petconnect.backend.dto.address.AddressDTO;
import org.petconnect.backend.dto.pet.CreatePetRequest;
import org.petconnect.backend.dto.pet.PetDTO;
import org.petconnect.backend.dto.pet.PetFilters;
import org.petconnect.backend.dto.pet.PetsResponse;
import org.petconnect.backend.dto.user.UserDTO;
import org.petconnect.backend.service.PetService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

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
            @Parameter(description = "Minimum age in months") @RequestParam(required = false) Integer minAge,
            @Parameter(description = "Maximum age in months") @RequestParam(required = false) Integer maxAge,
            @Parameter(description = "Filter by gender") @RequestParam(required = false) String gender,
            @Parameter(description = "Filter by city") @RequestParam(required = false) String city,
            @Parameter(description = "Filter by country") @RequestParam(required = false) String country,
            @Parameter(description = "Search query") @RequestParam(required = false) String search,
            @Parameter(description = "Sort field (newest, oldest, youngest, eldest, name_asc, name_desc, distance)") @RequestParam(required = false) String sortBy,
            @Parameter(description = "Latitude for distance-based sorting") @RequestParam(required = false) Double lat,
            @Parameter(description = "Longitude for distance-based sorting") @RequestParam(required = false) Double lng,
            @Parameter(description = "Number of items per page") @RequestParam(required = false, defaultValue = "12") Integer limit) {
        // Build filters from request params
        PetFilters filters = PetFilters.builder()
                .species(species)
                .breed(breed)
                .ageRange(minAge != null || maxAge != null ? PetFilters.AgeRange.builder()
                        .min(minAge)
                        .max(maxAge)
                        .build() : null)
                .gender(gender)
                .city(city)
                .country(country)
                .searchQuery(search)
                .sortBy(sortBy)
                .location(lat != null && lng != null ? PetFilters.Location.builder()
                        .lat(lat)
                        .lng(lng)
                        .build() : null)
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

    @Operation(summary = "Get pet's address", description = "Retrieves the address for a specific pet. Returns the full address for shelter pets, but only city and country for personal pets.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved address"),
            @ApiResponse(responseCode = "404", description = "Pet not found")
    })
    @GetMapping("/{petId}/address")
    public ResponseEntity<AddressDTO> getPetAddress(
            @Parameter(description = "ID of the pet", required = true) @PathVariable UUID petId) {
        return ResponseEntity.ok(petService.getPetAddress(petId));
    }

    @Operation(summary = "Get pet's full address", description = "Retrieves the complete address for a specific pet. This endpoint is protected and requires user authentication.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved full address"),
            @ApiResponse(responseCode = "401", description = "Not authenticated"),
            @ApiResponse(responseCode = "404", description = "Pet not found")
    })
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/{petId}/full-address")
    public ResponseEntity<AddressDTO> getFullPetAddress(
            @Parameter(description = "ID of the pet", required = true) @PathVariable UUID petId) {
        return ResponseEntity.ok(petService.getFullPetAddress(petId));
    }
}