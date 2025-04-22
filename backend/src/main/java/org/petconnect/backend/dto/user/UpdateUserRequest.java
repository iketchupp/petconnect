package org.petconnect.backend.dto.user;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request to update user information")
public class UpdateUserRequest {
    @Size(min = 2, max = 100, message = "First name must be between 2 and 100 characters")
    @Schema(description = "User's first name", example = "John", maxLength = 100)
    private String firstName;

    @Size(min = 2, max = 100, message = "Last name must be between 2 and 100 characters")
    @Schema(description = "User's last name", example = "Smith", maxLength = 100)
    private String lastName;

    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    @Schema(description = "User's username", example = "jsmith", maxLength = 50)
    private String username;

    @Email(message = "Invalid email format")
    @Schema(description = "User's email address", example = "john.smith@example.com")
    private String email;

    @Size(min = 6, message = "Password must be at least 6 characters")
    @Schema(description = "User's password (optional)", example = "password123", nullable = true)
    private String password;
}