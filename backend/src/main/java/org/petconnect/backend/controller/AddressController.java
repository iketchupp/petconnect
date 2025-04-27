package org.petconnect.backend.controller;

import java.util.List;

import org.petconnect.backend.service.AddressService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/locations")
@Tag(name = "Locations", description = "API endpoints for managing location data")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;

    @Operation(summary = "Get cities by country", description = "Retrieves all distinct cities for a specific country")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved cities"),
            @ApiResponse(responseCode = "400", description = "Country parameter is missing")
    })
    @GetMapping("/cities")
    public ResponseEntity<List<String>> getCitiesByCountry(
            @Parameter(description = "Country to get cities for", required = true) @RequestParam String country) {
        if (country == null || country.trim().isEmpty()) {
            throw new IllegalArgumentException("Country parameter is missing or empty");
        }
        return ResponseEntity.ok(addressService.getCitiesByCountry(country));
    }

    @Operation(summary = "Get all countries", description = "Retrieves all distinct countries from the database")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved countries")
    })
    @GetMapping("/countries")
    public ResponseEntity<List<String>> getAllCountries() {
        return ResponseEntity.ok(addressService.getAllCountries());
    }
}