package org.petconnect.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.Parameter;

import org.petconnect.backend.dto.user.UserDTO;
import org.petconnect.backend.dto.user.UpdateUserRequest;
import org.petconnect.backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/user")
@RequiredArgsConstructor
@Tag(name = "User", description = "Endpoints for managing user")
@SecurityRequirement(name = "bearerAuth")
public class UserController {

    private final UserService userService;

    @Operation(summary = "Get current user", description = "Retrieves the profile of the currently authenticated user")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved user profile"),
            @ApiResponse(responseCode = "401", description = "Not authenticated"),
            @ApiResponse(responseCode = "404", description = "User not found")
    })
    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok(userService.getUser(authentication.getName()));
    }

    @Operation(summary = "Update current user", description = "Update the profile of the currently authenticated user")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully updated user profile"),
            @ApiResponse(responseCode = "400", description = "Invalid input data or email/username already in use"),
            @ApiResponse(responseCode = "401", description = "Not authenticated"),
            @ApiResponse(responseCode = "404", description = "User not found")
    })
    @PutMapping("/me")
    public ResponseEntity<UserDTO> updateCurrentUser(@Valid @RequestBody UpdateUserRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok(userService.updateUser(authentication.getName(), request));
    }

    @Operation(summary = "Upload avatar", description = "Upload a new avatar image for the current user")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully uploaded avatar"),
            @ApiResponse(responseCode = "400", description = "Invalid file type or empty file"),
            @ApiResponse(responseCode = "401", description = "Not authenticated")
    })
    @PostMapping(value = "/avatar", consumes = "multipart/form-data")
    public ResponseEntity<?> uploadAvatar(
            @Parameter(description = "Avatar image file to upload", required = true) @RequestParam("file") MultipartFile file) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok(userService.updateAvatar(authentication.getName(), file));
    }

    @Operation(summary = "Remove avatar", description = "Remove the current user's avatar image")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully removed avatar"),
            @ApiResponse(responseCode = "400", description = "User has no avatar to remove"),
            @ApiResponse(responseCode = "401", description = "Not authenticated"),
            @ApiResponse(responseCode = "404", description = "User not found")
    })
    @DeleteMapping("/avatar")
    public ResponseEntity<Void> removeAvatar() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        userService.removeAvatar(authentication.getName());
        return ResponseEntity.ok().build();
    }
}