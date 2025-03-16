package org.petconnect.backend.config;

import com.github.javafaker.Faker;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.petconnect.backend.model.*;
import org.petconnect.backend.repository.*;
import org.petconnect.backend.service.ImageService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StreamUtils;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    @PersistenceContext
    private EntityManager entityManager;

    private final UserRepository userRepository;
    private final ShelterRepository shelterRepository;
    private final PetRepository petRepository;
    private final AddressRepository addressRepository;
    private final ImageRepository imageRepository;
    private final PetImageRepository petImageRepository;
    private final AvatarImageRepository avatarImageRepository;
    private final ImageService imageService;
    private final PasswordEncoder passwordEncoder;

    private final Random random = new Random();
    private final Faker faker = new Faker();

    private static final String[] SAMPLE_PET_IMAGES = {
            "sample/pets/dog1.jpg",
            "sample/pets/dog2.jpg",
            "sample/pets/dog3.jpg",
            "sample/pets/cat1.jpg",
            "sample/pets/cat2.jpg",
            "sample/pets/cat3.jpg"
    };

    private static final String[] SAMPLE_AVATAR_IMAGES = {
            "sample/avatars/avatar1.jpg",
            "sample/avatars/avatar2.jpg",
            "sample/avatars/avatar3.jpg"
    };

    @Transactional
    public void clearDatabase() {
        // First break all relationships using native queries
        entityManager
                .createNativeQuery("UPDATE \"user\" SET avatar_image_id = NULL")
                .executeUpdate();

        entityManager
                .createNativeQuery("UPDATE \"shelter\" SET avatar_image_id = NULL")
                .executeUpdate();

        // Delete all pet images first
        entityManager
                .createNativeQuery("DELETE FROM \"pet_image\"")
                .executeUpdate();

        // Delete all addresses
        entityManager
                .createNativeQuery("DELETE FROM \"address\"")
                .executeUpdate();

        // Delete all pets
        entityManager
                .createNativeQuery("DELETE FROM \"pet\"")
                .executeUpdate();

        // Delete shelters and users
        entityManager
                .createNativeQuery("DELETE FROM \"shelter\"")
                .executeUpdate();

        entityManager
                .createNativeQuery("DELETE FROM \"user\"")
                .executeUpdate();

        // Delete avatar images
        entityManager
                .createNativeQuery("DELETE FROM \"avatar_image\"")
                .executeUpdate();

        // Get all images before deletion to clean S3
        List<Image> allImages = imageRepository.findAll();

        // Delete all images from database
        entityManager
                .createNativeQuery("DELETE FROM \"image\"")
                .executeUpdate();

        // Finally clean up S3 storage
        for (Image image : allImages) {
            try {
                imageService.deleteImage(image.getKey());
            } catch (Exception e) {
                // Log but continue with deletion even if S3 deletion fails
                System.err.println("Failed to delete S3 image: " + image.getKey() + " - " + e.getMessage());
            }
        }
    }

    private Image uploadSampleImage(String resourcePath, String s3Folder) {
        try {
            var resource = new ClassPathResource(resourcePath);
            var bytes = StreamUtils.copyToByteArray(resource.getInputStream());
            var fileName = resourcePath.substring(resourcePath.lastIndexOf('/') + 1);
            var s3Key = s3Folder + "/" + UUID.randomUUID().toString() + "-" + fileName;

            var multipartFile = new MockMultipartFile(
                    s3Key,
                    fileName,
                    "image/jpeg",
                    bytes);

            imageService.uploadImage(multipartFile, s3Key);
            return imageRepository.findByKey(s3Key)
                    .orElseThrow(() -> new RuntimeException("Failed to find uploaded image"));
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload sample image: " + resourcePath, e);
        }
    }

    @Override
    @Transactional
    public void run(String... args) {
        // Only seed if the database is empty
        if (userRepository.count() > 0) {
            return;
        }

        // Create 30 users with avatars
        List<User> users = new ArrayList<>();
        for (int i = 0; i < 30; i++) {
            String firstName = faker.name().firstName();
            String lastName = faker.name().lastName();
            String username = (firstName + lastName).toLowerCase();

            User user = User.builder()
                    .firstName(firstName)
                    .lastName(lastName)
                    .username(username)
                    .email(username + "@" + faker.internet().domainName())
                    .passwordHash(passwordEncoder.encode("password123"))
                    .createdAt(LocalDateTime.now().minusDays(random.nextInt(365)))
                    .build();
            user = userRepository.save(user);

            // Add avatar to some users
            if (random.nextDouble() < 0.7) { // 70% chance of having an avatar
                Image avatarImage = uploadSampleImage(SAMPLE_AVATAR_IMAGES[random.nextInt(SAMPLE_AVATAR_IMAGES.length)],
                        "avatars");
                AvatarImage avatar = AvatarImage.builder()
                        .imageId(avatarImage.getId())
                        .build();
                avatar = avatarImageRepository.save(avatar);
                user.setAvatarImageId(avatar.getId());
                userRepository.save(user);
            }

            users.add(user);
        }

        // Create 15 shelters with avatars
        List<Shelter> shelters = new ArrayList<>();
        for (int i = 0; i < 15; i++) {
            User owner = users.get(random.nextInt(users.size()));
            String shelterName = faker.company().name() + " Animal Shelter";

            Shelter shelter = Shelter.builder()
                    .name(shelterName)
                    .description(faker.company().catchPhrase() + " for pets in need")
                    .phone(faker.phoneNumber().phoneNumber())
                    .email("contact@" + shelterName.toLowerCase().replaceAll("[^a-z0-9]", "") + ".com")
                    .website("www." + shelterName.toLowerCase().replaceAll("[^a-z0-9]", "") + ".com")
                    .ownerId(owner.getId())
                    .createdAt(LocalDateTime.now().minusDays(random.nextInt(365)))
                    .build();
            shelter = shelterRepository.save(shelter);

            // Add avatar to shelter
            if (random.nextDouble() < 0.8) { // 80% chance of having an avatar
                Image avatarImage = uploadSampleImage(SAMPLE_AVATAR_IMAGES[random.nextInt(SAMPLE_AVATAR_IMAGES.length)],
                        "avatars");
                AvatarImage avatar = AvatarImage.builder()
                        .imageId(avatarImage.getId())
                        .build();
                avatar = avatarImageRepository.save(avatar);
                shelter.setAvatarImageId(avatar.getId());
                shelterRepository.save(shelter);
            }

            // Create address for shelter
            Address address = Address.builder()
                    .shelterId(shelter.getId())
                    .address1(faker.address().streetAddress())
                    .city(faker.address().city())
                    .region(faker.address().stateAbbr())
                    .postalCode(faker.address().zipCode())
                    .country("United States")
                    .lat(faker.number().randomDouble(6, 25, 49))
                    .lng(faker.number().randomDouble(6, -125, -65))
                    .createdAt(LocalDateTime.now().minusDays(random.nextInt(365)))
                    .build();
            address.setFormattedAddress(String.format("%s, %s, %s %s",
                    address.getAddress1(), address.getCity(), address.getRegion(), address.getPostalCode()));
            addressRepository.save(address);

            shelters.add(shelter);
        }

        // Create 150 pets with images
        for (int i = 0; i < 150; i++) {
            boolean isDog = i < 100;
            String species = isDog ? "Dog" : "Cat";
            String breed = isDog
                    ? faker.dog().breed()
                    : faker.cat().breed();

            User creator = users.get(random.nextInt(users.size()));
            Shelter shelter = random.nextDouble() < 0.8 ? shelters.get(random.nextInt(shelters.size())) : null;

            // Random age between 1 month and 10 years
            int ageInMonths = random.nextInt(120) + 1;

            Pet pet = Pet.builder()
                    .name(faker.dog().name())
                    .description(generatePetDescription(species, breed, ageInMonths))
                    .species(species)
                    .breed(breed)
                    .gender(random.nextBoolean() ? "Male" : "Female")
                    .birthDate(LocalDate.now().minusMonths(ageInMonths))
                    .status(PetStatus.AVAILABLE)
                    .createdByUserId(creator.getId())
                    .shelterId(shelter != null ? shelter.getId() : null)
                    .createdAt(LocalDateTime.now().minusDays(random.nextInt(365)))
                    .build();
            pet = petRepository.save(pet);

            // Add 1-3 images for each pet
            int numImages = random.nextInt(3) + 1;
            boolean setPrimary = true;
            List<PetImage> petImages = new ArrayList<>();
            for (int j = 0; j < numImages; j++) {
                String[] imagePool = isDog
                        ? Arrays.stream(SAMPLE_PET_IMAGES).filter(img -> img.contains("dog")).toArray(String[]::new)
                        : Arrays.stream(SAMPLE_PET_IMAGES).filter(img -> img.contains("cat")).toArray(String[]::new);

                Image petImage = uploadSampleImage(imagePool[random.nextInt(imagePool.length)], "pets");
                PetImage petImageEntity = PetImage.builder()
                        .petId(pet.getId())
                        .imageId(petImage.getId())
                        .isPrimary(setPrimary)
                        .createdAt(LocalDateTime.now())
                        .build();
                petImages.add(petImageEntity);
                setPrimary = false;
            }

            // Save all images after pet is saved
            petImageRepository.saveAll(petImages);
        }
    }

    private String generatePetDescription(String species, String breed, int ageInMonths) {
        String trait = faker.dog().memePhrase();

        String ageDescription;
        if (ageInMonths < 12) {
            ageDescription = ageInMonths + " month-old";
        } else {
            int years = ageInMonths / 12;
            ageDescription = years + " year-old";
        }

        return String.format("A %s %s %s %s. %s and %s. %s",
                ageDescription,
                faker.commerce().material(),
                species.toLowerCase(),
                breed,
                faker.company().catchPhrase(),
                trait,
                "Looking for a loving forever home");
    }
}