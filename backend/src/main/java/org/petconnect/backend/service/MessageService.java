package org.petconnect.backend.service;

import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.petconnect.backend.dto.message.ConversationDTO;
import org.petconnect.backend.dto.message.MessageDTO;
import org.petconnect.backend.dto.message.SendMessageRequest;
import org.petconnect.backend.dto.message.WebSocketMessage;
import org.petconnect.backend.dto.user.UserDTO;
import org.petconnect.backend.model.Message;
import org.petconnect.backend.model.Pet;
import org.petconnect.backend.model.PetStatus;
import org.petconnect.backend.model.Shelter;
import org.petconnect.backend.repository.MessageRepository;
import org.petconnect.backend.repository.PetRepository;
import org.petconnect.backend.repository.ShelterRepository;
import org.petconnect.backend.repository.UserRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final PetRepository petRepository;
    private final ShelterRepository shelterRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private static final ZoneId UTC = ZoneId.of("UTC");

    @Transactional
    public MessageDTO sendMessage(UUID senderId, SendMessageRequest request) {
        // Validate that pet ID is provided
        if (request.getPetId() == null) {
            throw new IllegalArgumentException("Pet ID is required for all messages");
        }

        // Make sure sentAt is in UTC
        ZonedDateTime sentAtUTC = request.getSentAt();
        if (sentAtUTC == null) {
            sentAtUTC = ZonedDateTime.now(UTC);
        } else if (!UTC.equals(sentAtUTC.getZone())) {
            sentAtUTC = sentAtUTC.withZoneSameInstant(UTC);
        }

        // Create and save the message
        Message message = Message.builder()
                .senderId(senderId)
                .receiverId(request.getReceiverId())
                .content(request.getContent())
                .petId(request.getPetId())
                .shelterId(request.getShelterId())
                .isRead(false)
                .sentAt(sentAtUTC)
                .build();

        message = messageRepository.save(message);

        // Convert to DTO
        MessageDTO messageDTO = MessageDTO.fromEntity(message);

        // Send the message via WebSocket
        WebSocketMessage wsMessage = WebSocketMessage.builder()
                .type(WebSocketMessage.MessageType.NEW_MESSAGE)
                .payload(messageDTO)
                .build();

        messagingTemplate.convertAndSendToUser(
                request.getReceiverId().toString(),
                "/queue/messages",
                wsMessage);

        return messageDTO;
    }

    public List<ConversationDTO> getUserConversations(UUID userId) {
        List<Message> latestMessages = messageRepository.findUserConversations(userId);

        return latestMessages.stream()
                .map(message -> ConversationDTO.fromLatestMessage(message, userId))
                .filter(conversation -> conversation != null && conversation.getPet() != null)
                .collect(Collectors.toList());
    }

    public List<ConversationDTO> getUnreadConversations(UUID userId) {
        List<Message> latestMessages = messageRepository.findUnreadConversations(userId);

        return latestMessages.stream()
                .map(message -> ConversationDTO.fromLatestMessage(message, userId))
                .filter(conversation -> conversation != null && conversation.getPet() != null)
                .collect(Collectors.toList());
    }

    public List<MessageDTO> getConversationAboutPet(UUID userId, UUID otherUserId, UUID petId) {
        List<Message> messages = messageRepository.findConversationAboutPet(userId, otherUserId, petId);

        // Mark messages as read
        markMessagesAboutPetAsRead(userId, otherUserId, petId);

        return messages.stream()
                .map(MessageDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public void markMessagesAsRead(UUID userId, UUID otherUserId) {
        messageRepository.markConversationAsRead(userId, otherUserId);

        // Send read receipt via WebSocket
        WebSocketMessage wsMessage = WebSocketMessage.builder()
                .type(WebSocketMessage.MessageType.READ_RECEIPT)
                .payload(Map.of("userId", otherUserId))
                .build();

        messagingTemplate.convertAndSendToUser(
                otherUserId.toString(),
                "/queue/messages",
                wsMessage);
    }

    @Transactional
    public void markMessagesAboutPetAsRead(UUID userId, UUID otherUserId, UUID petId) {
        messageRepository.markConversationAboutPetAsRead(userId, otherUserId, petId);

        // Send read receipt via WebSocket
        WebSocketMessage wsMessage = WebSocketMessage.builder()
                .type(WebSocketMessage.MessageType.READ_RECEIPT)
                .payload(Map.of("userId", otherUserId, "petId", petId))
                .build();

        messagingTemplate.convertAndSendToUser(
                otherUserId.toString(),
                "/queue/messages",
                wsMessage);

        messagingTemplate.convertAndSendToUser(
                userId.toString(),
                "/queue/messages",
                wsMessage);
    }

    public long getUnreadMessageCount(UUID userId) {
        return messageRepository.countUnreadMessages(userId);
    }

    @Transactional
    public void updatePetStatus(UUID petId, PetStatus newStatus, UUID userId) {
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new IllegalArgumentException("Pet not found"));

        // Only the pet owner can update the status
        if (!pet.getCreatedByUserId().equals(userId) &&
                !(pet.getShelterId() != null &&
                        pet.getShelter().getOwnerId().equals(userId))) {
            throw new IllegalArgumentException("You are not authorized to update this pet's status");
        }

        // Cannot change status if already adopted
        if (pet.getStatus() == PetStatus.ADOPTED) {
            throw new IllegalArgumentException("Cannot change status of an adopted pet");
        }

        pet.setStatus(newStatus);
        petRepository.save(pet);

        // Notify all users who have messaged about this pet
        notifyPetStatusUpdate(pet);
    }

    @Transactional
    public void markPetAsAdopted(UUID petId, UUID userId) {
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new IllegalArgumentException("Pet not found"));

        // Anyone who has messaged about the pet can mark it as adopted
        boolean hasMessagedAboutPet = messageRepository
                .findConversationAboutPet(userId, pet.getCreatedByUserId(), petId)
                .stream()
                .anyMatch(m -> m.getSenderId().equals(userId) || m.getReceiverId().equals(userId));

        if (!hasMessagedAboutPet) {
            throw new IllegalArgumentException("You are not authorized to mark this pet as adopted");
        }

        pet.setStatus(PetStatus.ADOPTED);
        petRepository.save(pet);

        // Notify all users who have messaged about this pet
        notifyPetStatusUpdate(pet);
    }

    private void notifyPetStatusUpdate(Pet pet) {
        WebSocketMessage wsMessage = WebSocketMessage.builder()
                .type(WebSocketMessage.MessageType.PET_STATUS_UPDATE)
                .payload(Map.of(
                        "petId", pet.getId(),
                        "status", pet.getStatus()))
                .build();

        // Get all users who have messaged about this pet
        List<UUID> userIds = messageRepository.findAll().stream()
                .filter(m -> pet.getId().equals(m.getPetId()))
                .map(m -> List.of(m.getSenderId(), m.getReceiverId()))
                .flatMap(List::stream)
                .distinct()
                .collect(Collectors.toList());

        // Send notification to all these users
        userIds.forEach(userId -> messagingTemplate.convertAndSendToUser(
                userId.toString(),
                "/queue/messages",
                wsMessage));
    }

    public UserDTO getPetOwnerForMessaging(UUID petId) {
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new IllegalArgumentException("Pet not found"));

        // If the pet belongs to a shelter, get the shelter owner
        if (pet.getShelterId() != null) {
            Shelter shelter = shelterRepository.findById(pet.getShelterId())
                    .orElseThrow(() -> new IllegalArgumentException("Shelter not found"));
            return UserDTO.fromEntity(shelter.getOwner());
        }

        // Otherwise, return the user who created the pet
        return UserDTO.fromEntity(pet.getCreator());
    }
}