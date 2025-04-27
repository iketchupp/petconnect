package org.petconnect.backend.controller;

import java.util.List;
import java.util.UUID;

import org.petconnect.backend.dto.message.ConversationDTO;
import org.petconnect.backend.dto.message.MessageDTO;
import org.petconnect.backend.dto.message.SendMessageRequest;
import org.petconnect.backend.dto.user.UserDTO;
import org.petconnect.backend.service.MessageService;
import org.petconnect.backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/messages")
@RequiredArgsConstructor
@Tag(name = "Messages", description = "Endpoints for pet-related messaging system")
@SecurityRequirement(name = "bearerAuth")
public class MessageController {

    private final MessageService messageService;
    private final UserService userService;

    @Operation(summary = "Send a message", description = "Sends a message to another user about a pet (pet ID is required)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Message sent successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request data"),
            @ApiResponse(responseCode = "401", description = "Not authenticated")
    })
    @PostMapping
    public ResponseEntity<MessageDTO> sendMessage(@Valid @RequestBody SendMessageRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDTO currentUser = getUserFromAuthentication(authentication);

        MessageDTO sentMessage = messageService.sendMessage(currentUser.getId(), request);
        return ResponseEntity.ok(sentMessage);
    }

    @Operation(summary = "Get all pet conversations", description = "Get all pet-related conversations for the current user")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved conversations"),
            @ApiResponse(responseCode = "401", description = "Not authenticated")
    })
    @GetMapping("/conversations")
    public ResponseEntity<List<ConversationDTO>> getConversations() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDTO currentUser = getUserFromAuthentication(authentication);

        List<ConversationDTO> conversations = messageService.getUserConversations(currentUser.getId());
        return ResponseEntity.ok(conversations);
    }

    @Operation(summary = "Get unread pet conversations", description = "Get all pet-related conversations with unread messages for the current user")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved unread conversations"),
            @ApiResponse(responseCode = "401", description = "Not authenticated")
    })
    @GetMapping("/conversations/unread")
    public ResponseEntity<List<ConversationDTO>> getUnreadConversations() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDTO currentUser = getUserFromAuthentication(authentication);

        List<ConversationDTO> unreadConversations = messageService.getUnreadConversations(currentUser.getId());
        return ResponseEntity.ok(unreadConversations);
    }

    @Operation(summary = "Get conversation with user about a pet", description = "Get all messages between the current user and another user about a specific pet")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved messages"),
            @ApiResponse(responseCode = "401", description = "Not authenticated"),
            @ApiResponse(responseCode = "404", description = "User or pet not found")
    })
    @GetMapping("/conversations/{userId}/pets/{petId}")
    public ResponseEntity<List<MessageDTO>> getConversationAboutPet(
            @Parameter(description = "ID of the other user", required = true) @PathVariable UUID userId,
            @Parameter(description = "ID of the pet", required = true) @PathVariable UUID petId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDTO currentUser = getUserFromAuthentication(authentication);

        List<MessageDTO> messages = messageService.getConversationAboutPet(currentUser.getId(), userId, petId);
        return ResponseEntity.ok(messages);
    }

    @Operation(summary = "Mark conversation about pet as read", description = "Mark all messages from a user about a specific pet as read")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Messages marked as read"),
            @ApiResponse(responseCode = "401", description = "Not authenticated")
    })
    @PutMapping("/conversations/{userId}/pets/{petId}/read")
    public ResponseEntity<Void> markConversationAboutPetAsRead(
            @Parameter(description = "ID of the other user", required = true) @PathVariable UUID userId,
            @Parameter(description = "ID of the pet", required = true) @PathVariable UUID petId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDTO currentUser = getUserFromAuthentication(authentication);

        messageService.markMessagesAboutPetAsRead(currentUser.getId(), userId, petId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Get unread messages count", description = "Get the count of unread messages for the current user")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved unread message count"),
            @ApiResponse(responseCode = "401", description = "Not authenticated")
    })
    @GetMapping("/unread/count")
    public ResponseEntity<Long> getUnreadMessageCount() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDTO currentUser = getUserFromAuthentication(authentication);

        long count = messageService.getUnreadMessageCount(currentUser.getId());
        return ResponseEntity.ok(count);
    }

    // Helper method to get the current user from authentication
    private UserDTO getUserFromAuthentication(Authentication authentication) {
        return userService.getUser(authentication.getName());
    }
}