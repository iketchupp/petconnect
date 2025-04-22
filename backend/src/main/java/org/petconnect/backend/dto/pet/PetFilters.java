package org.petconnect.backend.dto.pet;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Filters for searching pets")
public class PetFilters {
    @Schema(description = "Filter by species", example = "Dog")
    private String species;

    @Schema(description = "Filter by breed", example = "Golden Retriever")
    private String breed;

    @Schema(description = "Filter by age range")
    private AgeRange ageRange;

    @Schema(description = "Filter by gender", example = "Male")
    private String gender;

    @Schema(description = "Filter by city", example = "New York")
    private String city;

    @Schema(description = "Filter by country", example = "United States")
    private String country;

    @Schema(description = "Search query to match against pet name and description")
    private String searchQuery;

    @Schema(description = "Sort field (newest, oldest, youngest, eldest, name_asc, name_desc, distance)", example = "newest")
    private String sortBy;

    @Schema(description = "Location coordinates for distance-based sorting")
    private Location location;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AgeRange {
        @Schema(description = "Minimum age in months", example = "6")
        private Integer min;

        @Schema(description = "Maximum age in months", example = "24")
        private Integer max;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Location {
        @Schema(description = "Latitude coordinate", example = "40.7128")
        private Double lat;

        @Schema(description = "Longitude coordinate", example = "-74.0060")
        private Double lng;
    }
}