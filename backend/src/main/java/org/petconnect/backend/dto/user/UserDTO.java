package org.petconnect.backend.dto.user;

import java.util.UUID;

import org.petconnect.backend.model.User;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "User information")
public class UserDTO {
    @Schema(description = "Unique identifier of the user", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID id;

    @Schema(description = "User's first name", example = "John")
    private String firstName;

    @Schema(description = "User's last name", example = "Smith")
    private String lastName;

    @Schema(description = "User's username", example = "jsmith")
    private String username;

    @Schema(description = "User's email address", example = "john.smith@example.com")
    private String email;

    @Schema(description = "URL of the user's avatar image", example = "https://storage.example.com/avatars/user123.jpg")
    private String avatarUrl;

    public static UserDTO fromEntity(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .username(user.getUsername())
                .email(user.getEmail())
                .avatarUrl(user.getAvatarImage() != null ? user.getAvatarImage().getImage().getUrl() : null)
                .build();
    }
}
