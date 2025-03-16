package org.petconnect.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.petconnect.backend.config.DataSeeder;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@Tag(name = "Admin", description = "Administrative APIs")
@SecurityRequirement(name = "bearerAuth")
public class AdminController {

    private final DataSeeder dataSeeder;

    @Operation(
        summary = "Reset database",
        description = "Clears the database. The database will be reseeded on next application restart."
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Database successfully cleared"),
        @ApiResponse(responseCode = "401", description = "Not authenticated"),
        @ApiResponse(responseCode = "403", description = "Not authorized")
    })
    @PostMapping("/database/reset")
    public ResponseEntity<String> resetDatabase() {
        dataSeeder.clearDatabase();
        return ResponseEntity.ok("Database cleared successfully. It will be reseeded on next application restart.");
    }
} 