package org.petconnect.backend.dto.favorite;

import java.util.List;

import org.petconnect.backend.dto.pet.PetDTO;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Response containing a list of favorited pets with pagination information")
public class FavoritesResponse {
    @Schema(description = "List of favorited pets")
    private List<PetDTO> pets;

    @Schema(description = "Cursor for the next page of results", example = "MTI=")
    private String nextCursor;

    @Schema(description = "Whether there are more results available")
    private boolean hasMore;

    @Schema(description = "Total number of favorited pets")
    private long totalCount;
}