package org.petconnect.backend.controller;

import java.util.UUID;

import org.petconnect.backend.dto.favorite.FavoritesResponse;
import org.petconnect.backend.service.FavoriteService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/favorites")
@RequiredArgsConstructor
@Tag(name = "Favorites", description = "Endpoints for managing pet favorites")
public class FavoriteController {
    private final FavoriteService favoriteService;

    @GetMapping
    @Operation(summary = "Get user's favorited pets", security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "List of favorited pets retrieved successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<FavoritesResponse> getFavoritePets(
            @Parameter(description = "Pagination cursor") @RequestParam(required = false) String cursor,
            @Parameter(description = "Number of items per page") @RequestParam(required = false, defaultValue = "12") Integer limit) {
        return ResponseEntity.ok(favoriteService.getFavoritePets(cursor, limit));
    }

    @PostMapping("/{petId}")
    @Operation(summary = "Add a pet to favorites", security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Pet favorited successfully"),
            @ApiResponse(responseCode = "400", description = "Pet is already favorited"),
            @ApiResponse(responseCode = "404", description = "Pet not found"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<Void> addFavorite(@PathVariable UUID petId) {
        favoriteService.addFavorite(petId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{petId}")
    @Operation(summary = "Remove a pet from favorites", security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Pet removed from favorites successfully"),
            @ApiResponse(responseCode = "400", description = "Pet is not favorited"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<Void> removeFavorite(@PathVariable UUID petId) {
        favoriteService.removeFavorite(petId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{petId}")
    @Operation(summary = "Check if a pet is favorited", security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Favorite status retrieved successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<Boolean> isPetFavorited(@PathVariable UUID petId) {
        return ResponseEntity.ok(favoriteService.isPetFavorited(petId));
    }
}