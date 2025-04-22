package org.petconnect.backend.dto.shelter;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Filters for searching shelters")
public class ShelterFilters {
    @Schema(description = "Search query to match against shelter name and description")
    private String searchQuery;

    @Schema(description = "Sort field (newest, oldest, name_asc, name_desc, distance)")
    private String sortBy;

    @Schema(description = "Filter by city", example = "New York")
    private String city;

    @Schema(description = "Filter by country", example = "United States")
    private String country;

    @Schema(description = "Location for distance-based sorting")
    @Builder.Default
    private Location location = null;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "Location coordinates for distance-based sorting")
    public static class Location {
        @Schema(description = "Latitude coordinate")
        private Double lat;

        @Schema(description = "Longitude coordinate")
        private Double lng;
    }
}