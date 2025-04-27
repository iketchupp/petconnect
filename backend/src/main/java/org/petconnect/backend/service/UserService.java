package org.petconnect.backend.service;

import java.util.List;
import java.util.UUID;

import org.petconnect.backend.dto.file.FileResponse;
import org.petconnect.backend.dto.pet.PetDTO;
import org.petconnect.backend.dto.pet.PetsResponse;
import org.petconnect.backend.dto.shelter.ShelterDTO;
import org.petconnect.backend.dto.shelter.SheltersResponse;
import org.petconnect.backend.dto.user.UpdateUserRequest;
import org.petconnect.backend.dto.user.UserDTO;
import org.petconnect.backend.exception.ResourceNotFoundException;
import org.petconnect.backend.model.AvatarImage;
import org.petconnect.backend.model.Image;
import org.petconnect.backend.model.Pet;
import org.petconnect.backend.model.Shelter;
import org.petconnect.backend.model.User;
import org.petconnect.backend.repository.AvatarImageRepository;
import org.petconnect.backend.repository.ImageRepository;
import org.petconnect.backend.repository.PetRepository;
import org.petconnect.backend.repository.ShelterRepository;
import org.petconnect.backend.repository.UserRepository;
import org.petconnect.backend.util.PaginationUtil;
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
    private final PetRepository petRepository;
    private final ShelterRepository shelterRepository;

    public UserDTO getUser(String identifier) {
        // Try to parse the identifier as a UUID first
        try {
            UUID userId = UUID.fromString(identifier);
            return getUserById(userId);
        } catch (IllegalArgumentException e) {
            // If it's not a valid UUID, assume it's an email
            User user = userRepository.findByEmail(identifier)
                    .orElseThrow(() -> new ResourceNotFoundException("User", "email", identifier));
            return UserDTO.fromEntity(user);
        }
    }

    public UserDTO getUserById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        return UserDTO.fromEntity(user);
    }

    @Transactional
    public UserDTO updateUser(String email, UpdateUserRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

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
    public UserDTO updateAvatar(String email, MultipartFile file) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

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

        return UserDTO.fromEntity(user);
    }

    @Transactional
    public void removeAvatar(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        UUID avatarId = user.getAvatarImageId();
        if (avatarId == null) {
            throw new IllegalStateException("User has no avatar to remove");
        }

        // Get the avatar image record
        AvatarImage avatar = avatarImageRepository.findById(avatarId)
                .orElseThrow(() -> new ResourceNotFoundException("Avatar", "id", avatarId));

        // Update user to remove avatar reference
        user.setAvatarImageId(null);
        user.setAvatarImage(null);
        userRepository.save(user);

        // Delete the avatar image from storage and database
        imageService.deleteImage(avatar.getImage().getKey());
        avatarImageRepository.delete(avatar);
    }

    public PetsResponse getUserPets(String email, String cursor, Integer limit) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Parse cursor if provided
        int offset = 0;
        if (cursor != null && !cursor.isEmpty()) {
            offset = Integer.parseInt(cursor);
        }

        // Process limit - if limit is 0, return all data
        int processedLimit = PaginationUtil.processLimit(limit);

        // Get the limit to use for the query
        int queryLimit = PaginationUtil.getQueryLimit(processedLimit);

        // Get paginated pets
        List<Pet> pets = petRepository.findByOwnerIdWithPagination(user.getId(), queryLimit, offset);

        // Get total count for pagination
        long totalCount = petRepository.countByOwnerId(user.getId());

        // Process results
        PaginationUtil.PaginationResult<Pet> result = PaginationUtil.processResults(pets, processedLimit);

        // Convert to DTOs
        List<PetDTO> petDTOs = result.getResults().stream()
                .map(PetDTO::fromEntity)
                .toList();

        // Calculate next cursor
        String nextCursor = null;
        if (result.hasMore()) {
            nextCursor = String.valueOf(offset + processedLimit);
        }

        return PetsResponse.builder()
                .pets(petDTOs)
                .nextCursor(nextCursor)
                .hasMore(result.hasMore())
                .totalCount(totalCount)
                .build();
    }

    public SheltersResponse getUserShelters(String email, String cursor, Integer limit) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Parse cursor if provided
        int offset = 0;
        if (cursor != null && !cursor.isEmpty()) {
            offset = Integer.parseInt(cursor);
        }

        // Process limit - if limit is 0, return all data
        int processedLimit = PaginationUtil.processLimit(limit);

        // Get the limit to use for the query
        int queryLimit = PaginationUtil.getQueryLimit(processedLimit);

        // Get paginated shelters owned by user
        List<Shelter> shelters = shelterRepository.findByOwnerIdOrderByCreatedAtDesc(user.getId(), queryLimit, offset);

        long totalCount = shelterRepository.countByOwnerId(user.getId());

        // Process results
        PaginationUtil.PaginationResult<Shelter> result = PaginationUtil.processResults(shelters, processedLimit);

        // Convert to DTOs
        List<ShelterDTO> shelterDTOs = result.getResults().stream()
                .map(ShelterDTO::fromEntity)
                .toList();

        // Calculate next cursor
        String nextCursor = null;
        if (result.hasMore()) {
            nextCursor = String.valueOf(offset + processedLimit);
        }

        return SheltersResponse.builder()
                .shelters(shelterDTOs)
                .nextCursor(nextCursor)
                .hasMore(result.hasMore())
                .totalCount(totalCount)
                .build();
    }
}
