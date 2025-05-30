package org.petconnect.backend.dto.message;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReadMessagePayload {
    private UUID userId;
    private UUID petId;
}