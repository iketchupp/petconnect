package org.petconnect.backend.service;

import java.util.Base64;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.petconnect.backend.dto.file.FileResponse;
import org.petconnect.backend.dto.pet.PetDTO;
import org.petconnect.backend.dto.pet.PetsResponse;
import org.petconnect.backend.dto.shelter.CreateShelterRequest;
import org.petconnect.backend.dto.shelter.ShelterDTO;
import org.petconnect.backend.dto.shelter.ShelterFilters;
import org.petconnect.backend.dto.shelter.SheltersResponse;
import org.petconnect.backend.dto.user.UserDTO;
import org.petconnect.backend.exception.ResourceNotFoundException;
import org.petconnect.backend.model.Address;
import org.petconnect.backend.model.AvatarImage;
import org.petconnect.backend.model.Image;
import org.petconnect.backend.model.Pet;
import org.petconnect.backend.model.Shelter;
import org.petconnect.backend.model.ShelterAddress;
import org.petconnect.backend.repository.AddressRepository;
import org.petconnect.backend.repository.AvatarImageRepository;
import org.petconnect.backend.repository.ImageRepository;
import org.petconnect.backend.repository.PetRepository;
import org.petconnect.backend.repository.ShelterAddressRepository;
import org.petconnect.backend.repository.ShelterRepository;
import org.petconnect.backend.util.PaginationUtil;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ShelterService {
    private final ShelterRepository shelterRepository;
    private final AddressRepository addressRepository;
    private final ShelterAddressRepository shelterAddressRepository;
    private final PetRepository petRepository;
    private final UserService userService;
    private final ImageService imageService;
    private final ImageRepository imageRepository;
    private final AvatarImageRepository avatarImageRepository;

    @SuppressWarnings("UseSpecificCatch")
    public SheltersResponse getShelters(String cursor, ShelterFilters filters, int limit) {
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

        // Get total count of shelters matching filters
        long totalCount = shelterRepository.countSheltersByFilters(
                filters.getSearchQuery(),
                filters.getCity(),
                filters.getCountry());

        // Get the limit to use for the query
        int queryLimit = PaginationUtil.getQueryLimit(limit);

        // Execute query with filters
        List<Shelter> shelters = shelterRepository.findSheltersByFilters(
                filters.getSearchQuery(),
                filters.getSortBy(),
                filters.getLocation() != null ? filters.getLocation().getLat() : null,
                filters.getLocation() != null ? filters.getLocation().getLng() : null,
                filters.getCity(),
                filters.getCountry(),
                queryLimit,
                offset);

        // Process results
        PaginationUtil.PaginationResult<Shelter> result = PaginationUtil.processResults(shelters, limit);

        // Convert to DTOs
        List<ShelterDTO> shelterDTOs = result.getResults().stream()
                .map(ShelterDTO::fromEntity)
                .collect(Collectors.toList());

        // Create next cursor if we have more results
        String nextCursor = null;
        if (result.hasMore()) {
            nextCursor = Base64.getEncoder().encodeToString(String.valueOf(offset + limit).getBytes());
        }

        return SheltersResponse.builder()
                .shelters(shelterDTOs)
                .nextCursor(nextCursor)
                .hasMore(result.hasMore())
                .totalCount(totalCount)
                .build();
    }

    public List<ShelterDTO> getAllShelters() {
        return shelterRepository.findAll().stream()
                .map(ShelterDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public ShelterDTO getShelterById(UUID id) {
        Shelter shelter = shelterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shelter", "id", id));
        return ShelterDTO.fromEntity(shelter);
    }

    public List<PetDTO> getShelterPets(UUID shelterId) {
        List<Pet> pets = petRepository.findByShelterIdOrderByCreatedAtDesc(shelterId);
        return pets.stream()
                .map(PetDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @SuppressWarnings("UseSpecificCatch")
    public PetsResponse getShelterPets(UUID shelterId, String cursor, int limit) {
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

        // Verify shelter exists
        shelterRepository.findById(shelterId)
                .orElseThrow(() -> new ResourceNotFoundException("Shelter", "id", shelterId));

        // Get total count of pets for this shelter
        long totalCount = petRepository.countByShelterIdAndStatusAvailable(shelterId);

        // Get the limit to use for the query
        int queryLimit = PaginationUtil.getQueryLimit(limit);

        // Get paginated pets using the repository method
        List<Pet> pets = petRepository.findByShelterIdWithPagination(shelterId, queryLimit, offset);

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

    @Transactional
    public ShelterDTO createShelter(CreateShelterRequest request) {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        UserDTO currentUser = userService.getUser(userEmail);

        // Create and save the shelter
        Shelter shelter = Shelter.builder()
                .name(request.getName())
                .description(request.getDescription())
                .phone(request.getPhone())
                .email(request.getEmail())
                .website(request.getWebsite())
                .ownerId(currentUser.getId())
                .build();
        shelter = shelterRepository.save(shelter);

        // Create and save the address if provided
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

            // Create the shelter address relationship
            ShelterAddress shelterAddress = ShelterAddress.builder()
                    .shelterId(shelter.getId())
                    .addressId(address.getId())
                    .build();

            shelterAddress = shelterAddressRepository.save(shelterAddress);
            shelter.setShelterAddress(shelterAddress);
        }

        return ShelterDTO.fromEntity(shelter);
    }

    @Transactional
    public ShelterDTO updateShelter(UUID id, CreateShelterRequest request) {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        UserDTO currentUser = userService.getUser(userEmail);

        Shelter shelter = shelterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shelter", "id", id));

        // Verify user is the owner
        if (!shelter.getOwnerId().equals(currentUser.getId())) {
            throw new IllegalArgumentException("Only the shelter owner can update the shelter");
        }

        // Update shelter fields
        shelter.setName(request.getName());
        shelter.setDescription(request.getDescription());
        shelter.setPhone(request.getPhone());
        shelter.setEmail(request.getEmail());
        shelter.setWebsite(request.getWebsite());
        shelter = shelterRepository.save(shelter);

        // Update or create address if provided
        if (request.getAddress() != null) {
            Address address;
            ShelterAddress shelterAddress = shelter.getShelterAddress();

            if (shelterAddress != null) {
                // Update existing address
                address = shelterAddress.getAddress();
            } else {
                // Create new address and relationship
                address = new Address();
                shelterAddress = ShelterAddress.builder()
                        .shelterId(shelter.getId())
                        .build();
            }

            // Update address fields
            address.setAddress1(request.getAddress().getAddress1());
            address.setAddress2(request.getAddress().getAddress2());
            address.setCity(request.getAddress().getCity());
            address.setRegion(request.getAddress().getRegion());
            address.setPostalCode(request.getAddress().getPostalCode());
            address.setCountry(request.getAddress().getCountry());
            address.setLat(request.getAddress().getLat());
            address.setLng(request.getAddress().getLng());
            address.setFormattedAddress(String.format("%s, %s, %s %s",
                    address.getAddress1(),
                    address.getCity(),
                    address.getRegion(),
                    address.getPostalCode()));

            address = addressRepository.save(address);

            if (shelterAddress.getId() == null) {
                shelterAddress.setAddressId(address.getId());
                shelterAddress = shelterAddressRepository.save(shelterAddress);
                shelter.setShelterAddress(shelterAddress);
            }
        }

        return ShelterDTO.fromEntity(shelter);
    }

    @Transactional
    public ShelterDTO uploadShelterAvatar(UUID shelterId, MultipartFile file) {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        UserDTO currentUser = userService.getUser(userEmail);

        Shelter shelter = shelterRepository.findById(shelterId)
                .orElseThrow(() -> new ResourceNotFoundException("Shelter", "id", shelterId));

        // Verify user is the owner
        if (!shelter.getOwnerId().equals(currentUser.getId())) {
            throw new IllegalArgumentException("Only the shelter owner can update this shelter");
        }

        // Delete old avatar if it exists
        if (shelter.getAvatarImageId() != null) {
            final UUID avatarId = shelter.getAvatarImageId();
            AvatarImage oldAvatar = avatarImageRepository.findById(avatarId)
                    .orElseThrow(() -> new ResourceNotFoundException("Avatar", "id", avatarId));
            imageService.deleteImage(oldAvatar.getImage().getKey());
            avatarImageRepository.delete(oldAvatar);
        }

        // Upload new avatar
        FileResponse response = imageService.uploadImage(file,
                "shelters/" + shelter.getId() + "/avatar/" + file.getOriginalFilename());
        Image image = imageRepository.findByKey(response.getObjectName())
                .orElseThrow(() -> new RuntimeException("Failed to find uploaded image"));

        // Create avatar image record
        AvatarImage avatar = AvatarImage.builder()
                .imageId(image.getId())
                .build();
        avatar = avatarImageRepository.save(avatar);

        // Update shelter with new avatar
        shelter.setAvatarImageId(avatar.getId());
        Shelter updatedShelter = shelterRepository.save(shelter);

        return ShelterDTO.fromEntity(updatedShelter);
    }

    public UserDTO getShelterOwner(UUID shelterId) {
        // Find the shelter by ID
        Shelter shelter = shelterRepository.findById(shelterId)
                .orElseThrow(() -> new ResourceNotFoundException("Shelter", "id", shelterId));

        // Get the owner ID from the shelter
        UUID ownerId = shelter.getOwnerId();

        // Find the user (owner) by their ID
        return userService.getUserById(ownerId);
    }

    @Transactional
    public void deleteShelter(UUID shelterId) {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        UserDTO currentUser = userService.getUser(userEmail);

        Shelter shelter = shelterRepository.findById(shelterId)
                .orElseThrow(() -> new ResourceNotFoundException("Shelter", "id", shelterId));

        // Verify user is the owner
        if (!shelter.getOwnerId().equals(currentUser.getId())) {
            throw new IllegalArgumentException("Only the shelter owner can delete this shelter");
        }

        // Find and delete all pets associated with the shelter
        List<Pet> shelterPets = petRepository.findByShelterIdOrderByCreatedAtDesc(shelterId);
        for (Pet pet : shelterPets) {
            // Store image keys for deletion after PetImage records are removed
            List<String> imageKeys = pet.getPetImages().stream()
                    .map(petImage -> petImage.getImage().getKey())
                    .collect(Collectors.toList());

            // Clear the pet's image collection to remove the PetImage records
            pet.getPetImages().clear();
            petRepository.save(pet);

            // Delete the actual image files
            imageKeys.forEach(key -> imageService.deleteImage(key));

            // Delete the pet
            petRepository.delete(pet);
        }

        // Delete shelter's avatar if exists
        if (shelter.getAvatarImageId() != null) {
            final UUID avatarId = shelter.getAvatarImageId();
            AvatarImage avatar = avatarImageRepository.findById(avatarId)
                    .orElseThrow(() -> new ResourceNotFoundException("Avatar", "id", avatarId));
            imageService.deleteImage(avatar.getImage().getKey());
            avatarImageRepository.delete(avatar);
        }

        // Delete shelter's address if exists
        if (shelter.getShelterAddress() != null) {
            ShelterAddress shelterAddress = shelter.getShelterAddress();
            Address address = shelterAddress.getAddress();

            shelterAddressRepository.delete(shelterAddress);
            addressRepository.delete(address);
        }

        // Delete the shelter
        shelterRepository.delete(shelter);
    }
}