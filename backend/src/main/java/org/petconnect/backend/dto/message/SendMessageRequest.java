package org.petconnect.backend.dto.message;

import java.time.ZonedDateTime;
import java.util.UUID;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request to send a new message")
public class SendMessageRequest {

    @NotNull(message = "Receiver ID is required")
    @Schema(description = "ID of the message receiver", example = "123e4567-e89b-12d3-a456-426614174000", required = true)
    private UUID receiverId;

    @NotBlank(message = "Content is required")
    @Size(max = 2000, message = "Content must be at most 2000 characters")
    @Schema(description = "Content of the message", example = "Hello, I am interested in adopting this pet.", maxLength = 2000, required = true)
    private String content;

    @NotNull(message = "Pet ID is required")
    @Schema(description = "ID of the pet related to the message", example = "123e4567-e89b-12d3-a456-426614174000", required = true)
    private UUID petId;

    @Schema(description = "ID of the shelter related to the message (optional)", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID shelterId;

    @Schema(description = "Timestamp when the message was sent by the client (in UTC)", example = "2023-06-01T15:30:45Z")
    private ZonedDateTime sentAt;
}