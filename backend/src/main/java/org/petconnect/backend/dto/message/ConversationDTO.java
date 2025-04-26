package org.petconnect.backend.dto.message;

import java.time.ZonedDateTime;
import java.util.UUID;

import org.petconnect.backend.dto.pet.PetDTO;
import org.petconnect.backend.dto.shelter.ShelterDTO;
import org.petconnect.backend.dto.user.UserDTO;
import org.petconnect.backend.model.Message;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Conversation information")
public class ConversationDTO {

    @Schema(description = "ID of the other user in the conversation", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID otherUserId;

    @Schema(description = "Information about the other user")
    private UserDTO otherUser;

    @Schema(description = "The last message in the conversation")
    private String lastMessage;

    @Schema(description = "Whether there are unread messages")
    private boolean hasUnread;

    @Schema(description = "ID of the shelter related to the conversation", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID shelterId;

    @Schema(description = "Information about the shelter")
    private ShelterDTO shelter;

    @Schema(description = "ID of the pet related to the conversation", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID petId;

    @Schema(description = "Information about the pet")
    private PetDTO pet;

    @Schema(description = "Timestamp of the last message (in UTC)", example = "2023-06-01T15:30:45Z")
    private ZonedDateTime lastMessageAt;

    public static ConversationDTO fromLatestMessage(Message message, UUID currentUserId) {
        if (message == null || message.getPet() == null) {
            return null;
        }

        UUID otherUserId = message.getSenderId().equals(currentUserId)
                ? message.getReceiverId()
                : message.getSenderId();

        UserDTO otherUser = message.getSenderId().equals(currentUserId)
                ? (message.getReceiver() != null ? UserDTO.fromEntity(message.getReceiver()) : null)
                : (message.getSender() != null ? UserDTO.fromEntity(message.getSender()) : null);

        boolean hasUnread = !message.getIsRead() && message.getReceiverId().equals(currentUserId);

        return ConversationDTO.builder()
                .otherUserId(otherUserId)
                .otherUser(otherUser)
                .lastMessage(message.getContent())
                .hasUnread(hasUnread)
                .shelterId(message.getShelterId())
                .shelter(message.getShelter() != null ? ShelterDTO.fromEntity(message.getShelter()) : null)
                .petId(message.getPetId())
                .pet(message.getPet() != null ? PetDTO.fromEntity(message.getPet()) : null)
                .lastMessageAt(message.getSentAt())
                .build();
    }
}