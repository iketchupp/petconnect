package org.petconnect.backend.service;

import java.util.UUID;

import org.petconnect.backend.dto.file.FileResponse;
import org.petconnect.backend.dto.user.UserDTO;
import org.petconnect.backend.dto.user.UpdateUserRequest;
import org.petconnect.backend.model.AvatarImage;
import org.petconnect.backend.model.Image;
import org.petconnect.backend.model.User;
import org.petconnect.backend.repository.AvatarImageRepository;
import org.petconnect.backend.repository.ImageRepository;
import org.petconnect.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final ImageService imageService;
    private final ImageRepository imageRepository;
    private final AvatarImageRepository avatarImageRepository;

    public UserDTO getUser(String v) {
        User user = userRepository.findByEmail(v)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return UserDTO.fromEntity(user);
    }

    @Transactional
    public UserDTO updateUser(String email, UpdateUserRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Validate unique constraints if email or username is being updated
        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new IllegalArgumentException("Email already in use");
            }
            user.setEmail(request.getEmail());
        }

        if (request.getUsername() != null && !request.getUsername().equals(user.getUsername())) {
            if (userRepository.existsByUsername(request.getUsername())) {
                throw new IllegalArgumentException("Username already in use");
            }
            user.setUsername(request.getUsername());
        }

        // Update other fields if provided
        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }

        user = userRepository.save(user);
        return UserDTO.fromEntity(user);
    }

    @Transactional
    public User updateAvatar(String email, MultipartFile file) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("User not found"));

        // Upload the new avatar image first
        FileResponse response = imageService.uploadImage(file,
                "avatars/" + UUID.randomUUID() + "-" + file.getOriginalFilename());
        Image image = imageRepository.findByKey(response.getObjectName())
                .orElseThrow(() -> new RuntimeException("Failed to find uploaded image"));

        // Create new avatar image record and save it first
        AvatarImage newAvatar = AvatarImage.builder()
                .imageId(image.getId())
                .build();
        newAvatar = avatarImageRepository.save(newAvatar);

        // Store old avatar information for cleanup
        UUID oldAvatarId = user.getAvatarImageId();

        // Update user with new avatar
        user.setAvatarImageId(newAvatar.getId());
        // Clear any transient reference to prevent flush issues
        user.setAvatarImage(null);
        user = userRepository.save(user);

        // Flush to ensure user update is committed
        userRepository.flush();

        // If user had an old avatar, delete it after the user reference has been
        // updated
        if (oldAvatarId != null) {
            AvatarImage oldAvatar = avatarImageRepository.findById(oldAvatarId)
                    .orElse(null);

            if (oldAvatar != null) {
                // Delete the old image from storage and database
                imageService.deleteImage(oldAvatar.getImage().getKey());
                avatarImageRepository.delete(oldAvatar);
            }
        }

        return user;
    }

    @Transactional
    public void removeAvatar(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("User not found"));

        UUID avatarId = user.getAvatarImageId();
        if (avatarId == null) {
            throw new IllegalStateException("User has no avatar to remove");
        }

        // Get the avatar image record
        AvatarImage avatar = avatarImageRepository.findById(avatarId)
                .orElseThrow(() -> new IllegalStateException("Avatar image not found"));

        // Update user to remove avatar reference
        user.setAvatarImageId(null);
        user.setAvatarImage(null);
        userRepository.save(user);

        // Delete the avatar image from storage and database
        imageService.deleteImage(avatar.getImage().getKey());
        avatarImageRepository.delete(avatar);
    }
}
