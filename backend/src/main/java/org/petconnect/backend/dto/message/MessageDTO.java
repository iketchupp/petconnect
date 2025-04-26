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
@Schema(description = "Message information")
public class MessageDTO {

    @Schema(description = "Unique identifier of the message", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID id;

    @Schema(description = "ID of the sender", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID senderId;

    @Schema(description = "ID of the receiver", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID receiverId;

    @Schema(description = "Content of the message", example = "Hi, I'm interested in adopting your pet.")
    private String content;

    @Schema(description = "Whether the message has been read")
    private Boolean isRead;

    @Schema(description = "ID of the shelter related to the message", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID shelterId;

    @Schema(description = "ID of the pet related to the message", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID petId;

    @Schema(description = "When the message was sent (in UTC)", example = "2023-06-01T15:30:45Z")
    private ZonedDateTime sentAt;

    @Schema(description = "Sender information")
    private UserDTO sender;

    @Schema(description = "Receiver information")
    private UserDTO receiver;

    @Schema(description = "Shelter information")
    private ShelterDTO shelter;

    @Schema(description = "Pet information")
    private PetDTO pet;

    public static MessageDTO fromEntity(Message message) {
        return MessageDTO.builder()
                .id(message.getId())
                .senderId(message.getSenderId())
                .receiverId(message.getReceiverId())
                .content(message.getContent())
                .isRead(message.getIsRead())
                .shelterId(message.getShelterId())
                .petId(message.getPetId())
                .sentAt(message.getSentAt())
                .sender(message.getSender() != null ? UserDTO.fromEntity(message.getSender()) : null)
                .receiver(message.getReceiver() != null ? UserDTO.fromEntity(message.getReceiver()) : null)
                .shelter(message.getShelter() != null ? ShelterDTO.fromEntity(message.getShelter()) : null)
                .pet(message.getPet() != null ? PetDTO.fromEntity(message.getPet()) : null)
                .build();
    }
}