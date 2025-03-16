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
    
    @Schema(description = "Filter by age category (puppy, young, adult, senior)", example = "young")
    private String age;  // Will be converted to a date range
    
    @Schema(description = "Filter by gender", example = "Male")
    private String gender;
    
    @Schema(description = "Search query to match against pet name and description")
    private String searchQuery;
    
    @Schema(description = "Sort field (newest, oldest, name)", example = "newest")
    private String sortBy;
} 