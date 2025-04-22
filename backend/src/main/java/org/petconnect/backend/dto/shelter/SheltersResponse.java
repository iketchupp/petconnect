package org.petconnect.backend.dto.shelter;

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
@Schema(description = "Response containing a list of shelters with pagination information")
public class SheltersResponse {
    @Schema(description = "List of shelters")
    private List<ShelterDTO> shelters;

    @Schema(description = "Cursor for the next page of results", example = "MTI=")
    private String nextCursor;

    @Schema(description = "Whether there are more results available")
    private boolean hasMore;

    @Schema(description = "Total number of shelters matching the filters")
    private long totalCount;
}