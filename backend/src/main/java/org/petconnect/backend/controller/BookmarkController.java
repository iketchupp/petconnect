package org.petconnect.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.petconnect.backend.dto.pet.PetDTO;
import org.petconnect.backend.service.BookmarkService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/bookmarks")
@RequiredArgsConstructor
@Tag(name = "Bookmarks", description = "Endpoints for managing pet bookmarks")
public class BookmarkController {
    private final BookmarkService bookmarkService;

    @GetMapping
    @Operation(summary = "Get user's bookmarked pets", security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "List of bookmarked pets retrieved successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<List<PetDTO>> getBookmarkedPets() {
        return ResponseEntity.ok(bookmarkService.getBookmarkedPets());
    }

    @PostMapping("/{petId}")
    @Operation(summary = "Add a pet to bookmarks", security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Pet bookmarked successfully"),
            @ApiResponse(responseCode = "400", description = "Pet is already bookmarked"),
            @ApiResponse(responseCode = "404", description = "Pet not found"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<Void> addBookmark(@PathVariable UUID petId) {
        bookmarkService.addBookmark(petId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{petId}")
    @Operation(summary = "Remove a pet from bookmarks", security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Pet removed from bookmarks successfully"),
            @ApiResponse(responseCode = "400", description = "Pet is not bookmarked"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<Void> removeBookmark(@PathVariable UUID petId) {
        bookmarkService.removeBookmark(petId);
        return ResponseEntity.ok().build();
    }
}