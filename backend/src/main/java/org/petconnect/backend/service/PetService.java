package org.petconnect.backend.service;

import lombok.RequiredArgsConstructor;
import org.petconnect.backend.dto.pet.CreatePetRequest;
import org.petconnect.backend.dto.pet.PetDTO;
import org.petconnect.backend.dto.pet.PetFilters;
import org.petconnect.backend.dto.pet.PetsResponse;
import org.petconnect.backend.dto.user.UserDTO;
import org.petconnect.backend.model.Pet;
import org.petconnect.backend.model.PetStatus;
import org.petconnect.backend.model.Shelter;
import org.petconnect.backend.model.PetImage;
import org.petconnect.backend.model.Image;
import org.petconnect.backend.repository.PetRepository;
import org.petconnect.backend.repository.ShelterRepository;
import org.petconnect.backend.repository.PetImageRepository;
import org.petconnect.backend.repository.ImageRepository;
import org.petconnect.backend.dto.file.FileResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.time.Period;
import java.util.Base64;
import java.util.List;
import java.util.stream.Collectors;
import java.util.UUID;
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
public class PetService {

    private final PetRepository petRepository;
    private final ShelterRepository shelterRepository;
    private final UserService userService;
    private final ImageService imageService;
    private final PetImageRepository petImageRepository;
    private final ImageRepository imageRepository;

    public PetDTO getPetById(UUID id) {
        Pet pet = petRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Pet not found"));
        return PetDTO.fromEntity(pet);
    }

    public PetsResponse getPets(String cursor, PetFilters filters, int limit) {
        // Calculate offset from cursor if provided
        int offset = 0;
        if (cursor != null) {
            try {
                offset = Integer.parseInt(new String(Base64.getDecoder().decode(cursor)));
            } catch (Exception e) {
                // Invalid cursor format, start from beginning
                offset = 0;
            }
        }

        // Convert age string to a date
        LocalDateTime minDate = null;
        if (filters.getAge() != null) {
            minDate = calculateDateFromAge(filters.getAge());
        }

        // Get total count of pets matching filters
        long totalCount = petRepository.countPetsByFilters(
                filters.getSpecies(),
                filters.getBreed(),
                filters.getGender(),
                minDate,
                filters.getSearchQuery());

        // Execute query with filters
        List<Pet> pets = petRepository.findPetsByFilters(
                filters.getSpecies(),
                filters.getBreed(),
                filters.getGender(),
                minDate,
                filters.getSearchQuery(),
                filters.getSortBy(),
                limit + 1, // Request one extra to determine if there are more
                offset);

        // Check if we have more results
        boolean hasMore = pets.size() > limit;

        // Remove the extra item if we have more
        if (hasMore) {
            pets = pets.subList(0, limit);
        }

        // Convert to DTOs
        List<PetDTO> petDTOs = pets.stream()
                .map(PetDTO::fromEntity)
                .collect(Collectors.toList());

        // Create next cursor if we have more results
        String nextCursor = null;
        if (hasMore) {
            nextCursor = Base64.getEncoder().encodeToString(String.valueOf(offset + limit).getBytes());
        }

        return PetsResponse.builder()
                .pets(petDTOs)
                .nextCursor(nextCursor)
                .hasMore(hasMore)
                .totalCount(totalCount)
                .build();
    }

    private LocalDateTime calculateDateFromAge(String age) {
        // Parse age string like "puppy", "young", "adult", "senior"
        // and convert to appropriate date ranges
        LocalDateTime now = LocalDateTime.now();

        return switch (age.toLowerCase()) {
            case "puppy", "baby" -> now.minus(Period.ofMonths(6));
            case "young" -> now.minus(Period.ofYears(2));
            case "adult" -> now.minus(Period.ofYears(8));
            case "senior" -> now.minus(Period.ofYears(100)); // Very old date to include all senior pets
            default -> null;
        };
    }

    public List<String> getAllSpecies() {
        return petRepository.findAllSpecies();
    }

    public List<String> getBreedsBySpecies(String species) {
        return petRepository.findBreedsBySpecies(species);
    }

    public List<String> getAllGenders() {
        return petRepository.findAllGenders();
    }

    @Transactional
    public PetDTO createPet(CreatePetRequest request) {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        System.out.println(userEmail);
        UserDTO currentUser = userService.getUser(userEmail);

        // If shelterId is provided, verify user is a member or owner of the shelter
        if (request.getShelterId() != null) {
            Shelter shelter = shelterRepository.findById(request.getShelterId())
                    .orElseThrow(() -> new IllegalArgumentException("Shelter not found"));

            boolean isOwnerOrMember = shelter.getOwnerId().equals(currentUser.getId()) ||
                    shelter.getMembers().stream()
                            .anyMatch(member -> member.getUserId().equals(currentUser.getId()));

            if (!isOwnerOrMember) {
                throw new IllegalArgumentException("User is not authorized to create pets for this shelter");
            }
        }

        Pet pet = Pet.builder()
                .name(request.getName())
                .description(request.getDescription())
                .species(request.getSpecies())
                .breed(request.getBreed())
                .gender(request.getGender())
                .birthDate(request.getBirthDate())
                .status(PetStatus.AVAILABLE)
                .createdByUserId(currentUser.getId())
                .shelterId(request.getShelterId())
                .build();

        pet = petRepository.save(pet);
        return PetDTO.fromEntity(pet);
    }

    @Transactional
    public PetDTO uploadPetImages(UUID petId, List<MultipartFile> files) {
        // Get the pet and verify it exists
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new IllegalArgumentException("Pet not found"));

        // Verify the current user has permission to modify this pet
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        UserDTO currentUser = userService.getUser(userEmail);

        boolean isAuthorized = pet.getCreatedByUserId().equals(currentUser.getId()) ||
                (pet.getShelterId() != null && pet.getShelter().getMembers().stream()
                        .anyMatch(member -> member.getUserId().equals(currentUser.getId())));

        if (!isAuthorized) {
            throw new IllegalArgumentException("User is not authorized to modify this pet");
        }

        // Check if there's already a primary image
        boolean hasPrimaryImage = pet.getPetImages().stream()
                .anyMatch(PetImage::getIsPrimary);

        List<PetImage> newPetImages = new ArrayList<>();
        for (int i = 0; i < files.size(); i++) {
            MultipartFile file = files.get(i);

            // Upload the image to storage and create image record
            FileResponse response = imageService.uploadImage(file,
                    "pets/" + UUID.randomUUID() + "-" + file.getOriginalFilename());
            Image image = imageRepository.findByKey(response.getObjectName())
                    .orElseThrow(() -> new RuntimeException("Failed to find uploaded image"));

            // Create pet image record
            PetImage petImage = PetImage.builder()
                    .petId(pet.getId())
                    .imageId(image.getId())
                    .isPrimary(!hasPrimaryImage && i == 0) // Set as primary if no primary exists and it's the first
                                                           // image
                    .build();

            newPetImages.add(petImage);
        }

        // Save all new pet images
        petImageRepository.saveAll(newPetImages);

        // Refresh the pet to get the updated image list
        pet = petRepository.findById(petId).orElseThrow();

        return PetDTO.fromEntity(pet);
    }

    public UserDTO getPetOwner(UUID petId) {
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new IllegalArgumentException("Pet not found"));

        // If the pet belongs to a shelter, return the shelter owner
        if (pet.getShelterId() != null) {
            return UserDTO.fromEntity(pet.getShelter().getOwner());
        }

        // Otherwise return the user who created the pet
        return UserDTO.fromEntity(pet.getCreator());
    }

    @Transactional
    public void deletePet(UUID petId) {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        UserDTO currentUser = userService.getUser(userEmail);

        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new IllegalArgumentException("Pet not found"));

        // Verify user has permission to delete the pet
        boolean isAuthorized = pet.getCreatedByUserId().equals(currentUser.getId()) ||
                (pet.getShelterId() != null && pet.getShelter().getMembers().stream()
                        .anyMatch(member -> member.getUserId().equals(currentUser.getId())));

        if (!isAuthorized) {
            throw new IllegalArgumentException("User is not authorized to delete this pet");
        }

        // Delete all associated pet images and their storage files
        pet.getPetImages().forEach(petImage -> {
            imageService.deleteImage(petImage.getImage().getKey());
        });

        // Delete the pet record
        petRepository.delete(pet);
    }
}