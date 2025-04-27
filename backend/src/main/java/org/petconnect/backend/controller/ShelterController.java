package org.petconnect.backend.controller;

import java.util.UUID;

import org.petconnect.backend.dto.pet.PetsResponse;
import org.petconnect.backend.dto.shelter.CreateShelterRequest;
import org.petconnect.backend.dto.shelter.ShelterDTO;
import org.petconnect.backend.dto.shelter.ShelterFilters;
import org.petconnect.backend.dto.shelter.SheltersResponse;
import org.petconnect.backend.dto.user.UserDTO;
import org.petconnect.backend.service.ShelterService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
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
@RequestMapping("/api/v1/shelters")
@RequiredArgsConstructor
@Tag(name = "Shelters", description = "Endpoints for managing shelters")
public class ShelterController {
    private final ShelterService shelterService;

    @Operation(summary = "Get all shelters", description = "Retrieves a paginated list of shelters with optional filtering and sorting")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved shelters list")
    })
    @GetMapping
    public ResponseEntity<SheltersResponse> getAllShelters(
            @Parameter(description = "Pagination cursor") @RequestParam(required = false) String cursor,
            @Parameter(description = "Search query") @RequestParam(required = false) String search,
            @Parameter(description = "Sort field (newest, oldest, name_asc, name_desc, distance)") @RequestParam(required = false) String sortBy,
            @Parameter(description = "Latitude for distance-based sorting") @RequestParam(required = false) Double lat,
            @Parameter(description = "Longitude for distance-based sorting") @RequestParam(required = false) Double lng,
            @Parameter(description = "Filter by city") @RequestParam(required = false) String city,
            @Parameter(description = "Filter by country") @RequestParam(required = false) String country,
            @Parameter(description = "Number of items per page") @RequestParam(required = false, defaultValue = "12") Integer limit) {
        // Build filters from request params
        ShelterFilters filters = ShelterFilters.builder()
                .searchQuery(search)
                .sortBy(sortBy)
                .city(city)
                .country(country)
                .location(lat != null && lng != null ? ShelterFilters.Location.builder()
                        .lat(lat)
                        .lng(lng)
                        .build() : null)
                .build();

        // Get shelters with pagination and filters
        SheltersResponse response = shelterService.getShelters(cursor, filters, limit);

        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Get shelter by ID", description = "Retrieves a specific shelter by its ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved shelter"),
            @ApiResponse(responseCode = "404", description = "Shelter not found")
    })
    @GetMapping("/{id}")
    public ResponseEntity<ShelterDTO> getShelterById(
            @Parameter(description = "ID of the shelter", required = true) @PathVariable UUID id) {
        return ResponseEntity.ok(shelterService.getShelterById(id));
    }

    @Operation(summary = "Get shelter owner", description = "Retrieves the owner details of a specific shelter")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved shelter owner"),
            @ApiResponse(responseCode = "404", description = "Shelter not found")
    })
    @GetMapping("/{id}/owner")
    public ResponseEntity<UserDTO> getShelterOwner(
            @Parameter(description = "ID of the shelter", required = true) @PathVariable UUID id) {
        return ResponseEntity.ok(shelterService.getShelterOwner(id));
    }

    @Operation(summary = "Get shelter pets", description = "Retrieves all pets associated with a specific shelter")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved shelter's pets"),
            @ApiResponse(responseCode = "404", description = "Shelter not found")
    })
    @GetMapping("/{id}/pets")
    public ResponseEntity<PetsResponse> getShelterPets(
            @Parameter(description = "ID of the shelter", required = true) @PathVariable UUID id,
            @Parameter(description = "Pagination cursor") @RequestParam(required = false) String cursor,
            @Parameter(description = "Number of items per page") @RequestParam(required = false, defaultValue = "12") Integer limit) {
        return ResponseEntity.ok(shelterService.getShelterPets(id, cursor, limit));
    }

    @Operation(summary = "Create a new shelter", description = "Creates a new animal shelter")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Successfully created shelter"),
            @ApiResponse(responseCode = "400", description = "Invalid input data"),
            @ApiResponse(responseCode = "401", description = "Not authenticated")
    })
    @SecurityRequirement(name = "bearerAuth")
    @PostMapping
    public ResponseEntity<ShelterDTO> createShelter(
            @Parameter(description = "Shelter creation request", required = true) @Valid @RequestBody CreateShelterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(shelterService.createShelter(request));
    }

    @Operation(summary = "Update a shelter", description = "Updates an existing shelter's information")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully updated shelter"),
            @ApiResponse(responseCode = "400", description = "Invalid input data"),
            @ApiResponse(responseCode = "401", description = "Not authenticated"),
            @ApiResponse(responseCode = "403", description = "Not authorized to update this shelter"),
            @ApiResponse(responseCode = "404", description = "Shelter not found")
    })
    @SecurityRequirement(name = "bearerAuth")
    @PutMapping("/{id}")
    public ResponseEntity<ShelterDTO> updateShelter(
            @Parameter(description = "ID of the shelter", required = true) @PathVariable UUID id,
            @Parameter(description = "Shelter update request", required = true) @Valid @RequestBody CreateShelterRequest request) {
        return ResponseEntity.ok(shelterService.updateShelter(id, request));
    }

    @Operation(summary = "Upload shelter avatar", description = "Uploads or updates the shelter's avatar image")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully uploaded shelter avatar"),
            @ApiResponse(responseCode = "400", description = "Invalid file type or empty file"),
            @ApiResponse(responseCode = "401", description = "Not authenticated"),
            @ApiResponse(responseCode = "403", description = "Not authorized to update this shelter"),
            @ApiResponse(responseCode = "404", description = "Shelter not found")
    })
    @SecurityRequirement(name = "bearerAuth")
    @PostMapping(value = "/{id}/avatar", consumes = "multipart/form-data")
    public ResponseEntity<ShelterDTO> uploadShelterAvatar(
            @Parameter(description = "ID of the shelter", required = true) @PathVariable UUID id,
            @Parameter(description = "Avatar image file", required = true) @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(shelterService.uploadShelterAvatar(id, file));
    }

    @Operation(summary = "Delete a shelter", description = "Deletes a shelter and all associated data. Only the shelter owner or administrators can delete the shelter.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Successfully deleted shelter"),
            @ApiResponse(responseCode = "401", description = "Not authenticated"),
            @ApiResponse(responseCode = "403", description = "Not authorized to delete this shelter"),
            @ApiResponse(responseCode = "404", description = "Shelter not found")
    })
    @SecurityRequirement(name = "bearerAuth")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteShelter(
            @Parameter(description = "ID of the shelter", required = true) @PathVariable UUID id) {
        shelterService.deleteShelter(id);
        return ResponseEntity.noContent().build();
    }
}