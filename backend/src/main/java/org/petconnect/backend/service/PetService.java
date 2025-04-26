package org.petconnect.backend.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.petconnect.backend.dto.address.AddressDTO;
import org.petconnect.backend.dto.file.FileResponse;
import org.petconnect.backend.dto.message.WebSocketMessage;
import org.petconnect.backend.dto.pet.CreatePetRequest;
import org.petconnect.backend.dto.pet.PetDTO;
import org.petconnect.backend.dto.pet.PetFilters;
import org.petconnect.backend.dto.pet.PetsResponse;
import org.petconnect.backend.dto.user.UserDTO;
import org.petconnect.backend.model.Address;
import org.petconnect.backend.model.Image;
import org.petconnect.backend.model.Pet;
import org.petconnect.backend.model.PetAddress;
import org.petconnect.backend.model.PetImage;
import org.petconnect.backend.model.PetStatus;
import org.petconnect.backend.model.Shelter;
import org.petconnect.backend.repository.AddressRepository;
import org.petconnect.backend.repository.ImageRepository;
import org.petconnect.backend.repository.MessageRepository;
import org.petconnect.backend.repository.PetAddressRepository;
import org.petconnect.backend.repository.PetImageRepository;
import org.petconnect.backend.repository.PetRepository;
import org.petconnect.backend.repository.ShelterRepository;
import org.petconnect.backend.util.PaginationUtil;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PetService {

    private final PetRepository petRepository;
    private final ShelterRepository shelterRepository;
    private final UserService userService;
    private final ImageService imageService;
    private final PetImageRepository petImageRepository;
    private final ImageRepository imageRepository;
    private final AddressRepository addressRepository;
    private final PetAddressRepository petAddressRepository;
    private final MessageRepository messageRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public PetDTO getPetById(UUID id) {
        Pet pet = petRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Pet not found"));
        return PetDTO.fromEntity(pet);
    }

    @SuppressWarnings("UseSpecificCatch")
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

        // Process limit - if limit is 0, return all data
        limit = PaginationUtil.processLimit(limit);

        // Convert age range to dates
        LocalDateTime minDate = null;
        LocalDateTime maxDate = null;
        if (filters.getAgeRange() != null) {
            LocalDateTime now = LocalDateTime.now();
            if (filters.getAgeRange().getMin() != null) {
                // For minimum age, we need the latest possible birth date
                minDate = now.minusMonths(filters.getAgeRange().getMin());
            }
            if (filters.getAgeRange().getMax() != null) {
                // For maximum age, we need the earliest possible birth date
                maxDate = now.minusMonths(filters.getAgeRange().getMax());
            }
        }

        // Get total count of pets matching filters
        long totalCount = petRepository.countPetsByFilters(
                filters.getSpecies(),
                filters.getBreed(),
                filters.getGender(),
                minDate,
                maxDate,
                filters.getSearchQuery(),
                filters.getCity(),
                filters.getCountry());

        // Get the limit to use for the query
        int queryLimit = PaginationUtil.getQueryLimit(limit);

        // Execute query with filters
        List<Pet> pets = petRepository.findPetsByFilters(
                filters.getSpecies(),
                filters.getBreed(),
                filters.getGender(),
                minDate,
                maxDate,
                filters.getSearchQuery(),
                filters.getSortBy(),
                filters.getLocation() != null ? filters.getLocation().getLat() : null,
                filters.getLocation() != null ? filters.getLocation().getLng() : null,
                filters.getCity(),
                filters.getCountry(),
                queryLimit,
                offset);

        // Process results
        PaginationUtil.PaginationResult<Pet> result = PaginationUtil.processResults(pets, limit);

        // Convert to DTOs
        List<PetDTO> petDTOs = result.getResults().stream()
                .map(PetDTO::fromEntity)
                .collect(Collectors.toList());

        // Create next cursor if we have more results
        String nextCursor = null;
        if (result.hasMore()) {
            nextCursor = Base64.getEncoder().encodeToString(String.valueOf(offset + limit).getBytes());
        }

        return PetsResponse.builder()
                .pets(petDTOs)
                .nextCursor(nextCursor)
                .hasMore(result.hasMore())
                .totalCount(totalCount)
                .build();
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
        UserDTO currentUser = userService.getUser(userEmail);

        // If shelterId is provided, verify user is a member or owner of the shelter
        if (request.getShelterId() != null) {
            Shelter shelter = shelterRepository.findById(request.getShelterId())
                    .orElseThrow(() -> new IllegalArgumentException("Shelter not found"));

            boolean isOwner = shelter.getOwnerId().equals(currentUser.getId());

            if (!isOwner) {
                throw new IllegalArgumentException("User is not authorized to create pets for this shelter");
            }

            // Shelter pets should not have an address
            if (request.getAddress() != null) {
                throw new IllegalArgumentException("Shelter pets should not have an address");
            }
        } else {
            // User pets must have an address
            if (request.getAddress() == null) {
                throw new IllegalArgumentException("Address is required for user pets");
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

        // Create address for user pets
        if (request.getAddress() != null) {
            // Create the address
            Address address = Address.builder()
                    .address1(request.getAddress().getAddress1())
                    .address2(request.getAddress().getAddress2())
                    .city(request.getAddress().getCity())
                    .region(request.getAddress().getRegion())
                    .postalCode(request.getAddress().getPostalCode())
                    .country(request.getAddress().getCountry())
                    .lat(request.getAddress().getLat())
                    .lng(request.getAddress().getLng())
                    .build();

            // Create formatted address
            address.setFormattedAddress(String.format("%s, %s, %s %s",
                    address.getAddress1(),
                    address.getCity(),
                    address.getRegion(),
                    address.getPostalCode()));

            address = addressRepository.save(address);

            // Create the pet address relationship
            PetAddress petAddress = PetAddress.builder()
                    .petId(pet.getId())
                    .addressId(address.getId())
                    .build();

            petAddress = petAddressRepository.save(petAddress);
            pet.setPetAddress(petAddress);
        }

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
                (pet.getShelterId() != null && pet.getShelter().getOwnerId().equals(currentUser.getId()));

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
                (pet.getShelterId() != null && pet.getShelter().getOwnerId().equals(currentUser.getId()));

        if (!isAuthorized) {
            throw new IllegalArgumentException("User is not authorized to delete this pet");
        }

        // Store image keys for deletion after PetImage records are removed
        List<String> imageKeys = pet.getPetImages().stream()
                .map(petImage -> petImage.getImage().getKey())
                .collect(Collectors.toList());

        // First clear the pet's image collection to remove the PetImage records
        pet.getPetImages().clear();
        petRepository.save(pet);

        // Now that the foreign key constraints are removed, delete the actual images
        imageKeys.forEach(key -> imageService.deleteImage(key));

        // Delete the pet record
        petRepository.delete(pet);
    }

    public AddressDTO getPetAddress(UUID petId) {
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new IllegalArgumentException("Pet not found"));

        // If pet is registered with a shelter, return shelter's address
        if (pet.getShelterId() != null) {
            Shelter shelter = shelterRepository.findById(pet.getShelterId())
                    .orElseThrow(() -> new IllegalArgumentException("Shelter not found"));
            return shelter.getAddress() != null ? AddressDTO.fromEntity(shelter.getAddress()) : null;
        }

        // Otherwise, return pet's address with restricted information (only city and
        // country)
        PetAddress petAddress = petAddressRepository.findByPetId(petId)
                .orElse(null);
        if (petAddress != null && petAddress.getAddress() != null) {
            Address address = petAddress.getAddress();
            // Create a new AddressDTO with only city and country fields populated
            return AddressDTO.builder()
                    .city(address.getCity())
                    .country(address.getCountry())
                    .formattedAddress(address.getCity() + ", " + address.getCountry())
                    .lat(address.getLat())
                    .lng(address.getLng())
                    .build();
        }
        return null;
    }

    public AddressDTO getFullPetAddress(UUID petId) {
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new IllegalArgumentException("Pet not found"));

        // If pet is registered with a shelter, return shelter's address
        if (pet.getShelterId() != null) {
            Shelter shelter = shelterRepository.findById(pet.getShelterId())
                    .orElseThrow(() -> new IllegalArgumentException("Shelter not found"));
            return shelter.getAddress() != null ? AddressDTO.fromEntity(shelter.getAddress()) : null;
        }

        // Return the complete pet address
        PetAddress petAddress = petAddressRepository.findByPetId(petId)
                .orElse(null);
        if (petAddress != null && petAddress.getAddress() != null) {
            return AddressDTO.fromEntity(petAddress.getAddress());
        }
        return null;
    }

    @Transactional
    public PetDTO updatePetStatus(UUID petId, PetStatus newStatus) {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        UserDTO currentUser = userService.getUser(userEmail);

        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new IllegalArgumentException("Pet not found"));

        // Verify user has permission to update the status
        boolean isAuthorized = pet.getCreatedByUserId().equals(currentUser.getId()) ||
                (pet.getShelterId() != null && pet.getShelter().getOwnerId().equals(currentUser.getId()));

        if (!isAuthorized) {
            throw new IllegalArgumentException("User is not authorized to update this pet's status");
        }

        // Cannot change status if already adopted
        if (pet.getStatus() == PetStatus.ADOPTED) {
            throw new IllegalArgumentException("Cannot change status of an adopted pet");
        }

        pet.setStatus(newStatus);
        pet = petRepository.save(pet);

        // Send WebSocket notification about status change
        notifyPetStatusUpdate(pet);

        return PetDTO.fromEntity(pet);
    }

    public UserDTO getUserByEmail(String email) {
        return userService.getUser(email);
    }

    @Transactional
    public PetDTO markPetAsAdopted(UUID petId, UUID userId) {
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new IllegalArgumentException("Pet not found"));

        // Check if the pet has PENDING status
        if (pet.getStatus() != PetStatus.PENDING) {
            throw new IllegalArgumentException("Only pets with PENDING status can be marked as adopted");
        }

        // Check if the user is the owner or has messaged about the pet
        boolean isOwner = pet.getCreatedByUserId().equals(userId) ||
                (pet.getShelterId() != null && pet.getShelter().getOwnerId().equals(userId));

        if (!isOwner) {
            // Check if user has messaged about the pet
            final UUID finalPetId = pet.getId();
            boolean hasMessagedAboutPet = messageRepository.findAll().stream()
                    .filter(m -> finalPetId.equals(m.getPetId()))
                    .anyMatch(m -> m.getSenderId().equals(userId) || m.getReceiverId().equals(userId));

            if (!hasMessagedAboutPet) {
                throw new IllegalArgumentException("User is not authorized to mark this pet as adopted");
            }
        }

        pet.setStatus(PetStatus.ADOPTED);
        pet = petRepository.save(pet);

        // Send WebSocket notification about adoption
        notifyPetStatusUpdate(pet);

        return PetDTO.fromEntity(pet);
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

        // Also include the pet owner
        userIds.add(pet.getCreatedByUserId());

        // If the pet belongs to a shelter, include the shelter owner too
        if (pet.getShelterId() != null && pet.getShelter() != null && pet.getShelter().getOwnerId() != null) {
            userIds.add(pet.getShelter().getOwnerId());
        }

        // Send notification to all these users
        userIds.forEach(userId -> messagingTemplate.convertAndSendToUser(
                userId.toString(),
                "/queue/messages",
                wsMessage));
    }
}