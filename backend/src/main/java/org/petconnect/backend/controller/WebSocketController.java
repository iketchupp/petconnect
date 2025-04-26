package org.petconnect.backend.controller;

import java.security.Principal;
import java.util.Map;
import java.util.UUID;

import org.petconnect.backend.dto.message.ReadMessagePayload;
import org.petconnect.backend.dto.message.SendMessageRequest;
import org.petconnect.backend.dto.message.TypingNotificationPayload;
import org.petconnect.backend.dto.message.WebSocketMessage;
import org.petconnect.backend.service.MessageService;
import org.petconnect.backend.service.UserService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
public class WebSocketController {

    private final MessageService messageService;
    private final UserService userService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/message")
    public void processMessage(@Payload SendMessageRequest request, Principal principal) {
        // Get the current user's ID
        UUID senderId = userService.getUser(principal.getName()).getId();

        // Validate that pet ID is provided
        if (request.getPetId() == null) {
            throw new IllegalArgumentException("Pet ID is required for all messages");
        }

        // Send the message using the message service
        messageService.sendMessage(senderId, request);
    }

    @MessageMapping("/message/read")
    public void markMessagesAsRead(@Payload UUID otherUserId, Principal principal) {
        // Get the current user's ID
        UUID userId = userService.getUser(principal.getName()).getId();

        // Mark messages as read
        messageService.markMessagesAsRead(userId, otherUserId);
    }

    @MessageMapping("/message/read/pet")
    public void markMessagesAboutPetAsRead(@Payload ReadMessagePayload payload, Principal principal) {
        // Get the current user's ID
        UUID userId = userService.getUser(principal.getName()).getId();

        // Mark messages as read
        messageService.markMessagesAboutPetAsRead(userId, payload.getUserId(), payload.getPetId());
    }

    @MessageMapping("/message/typing")
    public void typingNotification(@Payload TypingNotificationPayload payload, Principal principal) {
        UUID senderId = userService.getUser(principal.getName()).getId();

        WebSocketMessage wsMessage = WebSocketMessage.builder()
                .type(WebSocketMessage.MessageType.USER_TYPING)
                .payload(Map.of(
                        "senderId", senderId,
                        "petId", payload.getPetId()))
                .build();

        messagingTemplate.convertAndSendToUser(
                payload.getReceiverId().toString(),
                "/queue/messages",
                wsMessage);
    }

    @MessageMapping("/message/stop-typing")
    public void stoppedTypingNotification(@Payload TypingNotificationPayload payload, Principal principal) {
        UUID senderId = userService.getUser(principal.getName()).getId();

        WebSocketMessage wsMessage = WebSocketMessage.builder()
                .type(WebSocketMessage.MessageType.USER_STOPPED_TYPING)
                .payload(Map.of(
                        "senderId", senderId,
                        "petId", payload.getPetId()))
                .build();

        messagingTemplate.convertAndSendToUser(
                payload.getReceiverId().toString(),
                "/queue/messages",
                wsMessage);
    }
}