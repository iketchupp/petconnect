package org.petconnect.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.petconnect.backend.dto.pet.PetDTO;
import org.petconnect.backend.dto.shelter.CreateShelterRequest;
import org.petconnect.backend.dto.shelter.ShelterDTO;
import org.petconnect.backend.service.ShelterService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/shelters")
@RequiredArgsConstructor
@Tag(name = "Shelters", description = "Endpoints for managing shelters")
public class ShelterController {
    private final ShelterService shelterService;

    @Operation(summary = "Get all shelters", description = "Retrieves a list of all registered animal shelters")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved shelters list")
    })
    @GetMapping
    public ResponseEntity<List<ShelterDTO>> getAllShelters() {
        return ResponseEntity.ok(shelterService.getAllShelters());
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

    @Operation(summary = "Get shelter pets", description = "Retrieves all pets associated with a specific shelter")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved shelter's pets"),
            @ApiResponse(responseCode = "404", description = "Shelter not found")
    })
    @GetMapping("/{id}/pets")
    public ResponseEntity<List<PetDTO>> getShelterPets(
            @Parameter(description = "ID of the shelter", required = true) @PathVariable UUID id) {
        return ResponseEntity.ok(shelterService.getShelterPets(id));
    }

    @Operation(summary = "Create a new shelter", description = "Creates a new animal shelter")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Successfully created shelter"),
            @ApiResponse(responseCode = "400", description = "Invalid input data"),
            @ApiResponse(responseCode = "401", description = "Not authenticated")
    })
    @SecurityRequirement(name = "bearerAuth")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
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
}