package org.petconnect.backend.service;

import lombok.RequiredArgsConstructor;
import org.petconnect.backend.dto.pet.PetDTO;
import org.petconnect.backend.dto.shelter.CreateShelterRequest;
import org.petconnect.backend.dto.shelter.ShelterDTO;
import org.petconnect.backend.dto.user.UserDTO;
import org.petconnect.backend.model.Address;
import org.petconnect.backend.model.Pet;
import org.petconnect.backend.model.Shelter;
import org.petconnect.backend.repository.AddressRepository;
import org.petconnect.backend.repository.PetRepository;
import org.petconnect.backend.repository.ShelterRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ShelterService {
    private final ShelterRepository shelterRepository;
    private final AddressRepository addressRepository;
    private final PetRepository petRepository;
    private final UserService userService;

    public List<ShelterDTO> getAllShelters() {
        return shelterRepository.findAll().stream()
                .map(ShelterDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public ShelterDTO getShelterById(UUID id) {
        Shelter shelter = shelterRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Shelter not found"));
        return ShelterDTO.fromEntity(shelter);
    }

    public List<PetDTO> getShelterPets(UUID shelterId) {
        List<Pet> pets = petRepository.findByShelterIdOrderByCreatedAtDesc(shelterId);
        return pets.stream()
                .map(PetDTO::fromEntity)
                .collect(Collectors.toList());
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
            Address address = Address.builder()
                    .shelterId(shelter.getId())
                    .address1(request.getAddress().getAddress1())
                    .address2(request.getAddress().getAddress2())
                    .city(request.getAddress().getCity())
                    .region(request.getAddress().getRegion())
                    .postalCode(request.getAddress().getPostalCode())
                    .country(request.getAddress().getCountry())
                    .lat(request.getAddress().getLat())
                    .lng(request.getAddress().getLng())
                    .build();
            address.setFormattedAddress(String.format("%s, %s, %s %s",
                    address.getAddress1(), address.getCity(), address.getRegion(), address.getPostalCode()));
            addressRepository.save(address);
        }

        return ShelterDTO.fromEntity(shelter);
    }

    @Transactional
    public ShelterDTO updateShelter(UUID id, CreateShelterRequest request) {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        UserDTO currentUser = userService.getUser(userEmail);

        Shelter shelter = shelterRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Shelter not found"));

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
            Address address = shelter.getAddress();
            if (address == null) {
                address = new Address();
                address.setShelterId(shelter.getId());
            }

            address.setAddress1(request.getAddress().getAddress1());
            address.setAddress2(request.getAddress().getAddress2());
            address.setCity(request.getAddress().getCity());
            address.setRegion(request.getAddress().getRegion());
            address.setPostalCode(request.getAddress().getPostalCode());
            address.setCountry(request.getAddress().getCountry());
            address.setLat(request.getAddress().getLat());
            address.setLng(request.getAddress().getLng());
            address.setFormattedAddress(String.format("%s, %s, %s %s",
                    address.getAddress1(), address.getCity(), address.getRegion(), address.getPostalCode()));
            addressRepository.save(address);
        }

        return ShelterDTO.fromEntity(shelter);
    }
}