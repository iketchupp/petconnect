package org.petconnect.backend.dto.pet;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Response containing a list of pets with pagination information")
public class PetsResponse {
    @Schema(description = "List of pets")
    private List<PetDTO> pets;

    @Schema(description = "Cursor for the next page of results", example = "MTI=")
    private String nextCursor;

    @Schema(description = "Whether there are more results available")
    private boolean hasMore;

    @Schema(description = "Total number of pets matching the filters")
    private long totalCount;
}