package org.petconnect.backend.config;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Random;
import java.util.UUID;

import org.petconnect.backend.model.Address;
import org.petconnect.backend.model.AvatarImage;
import org.petconnect.backend.model.Image;
import org.petconnect.backend.model.Pet;
import org.petconnect.backend.model.PetAddress;
import org.petconnect.backend.model.PetImage;
import org.petconnect.backend.model.PetStatus;
import org.petconnect.backend.model.Shelter;
import org.petconnect.backend.model.ShelterAddress;
import org.petconnect.backend.model.User;
import org.petconnect.backend.repository.AddressRepository;
import org.petconnect.backend.repository.AvatarImageRepository;
import org.petconnect.backend.repository.ImageRepository;
import org.petconnect.backend.repository.PetAddressRepository;
import org.petconnect.backend.repository.PetImageRepository;
import org.petconnect.backend.repository.PetRepository;
import org.petconnect.backend.repository.ShelterAddressRepository;
import org.petconnect.backend.repository.ShelterRepository;
import org.petconnect.backend.repository.UserRepository;
import org.petconnect.backend.service.ImageService;
import org.petconnect.backend.service.StorageService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StreamUtils;

import com.github.javafaker.Faker;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;

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
    private final ShelterAddressRepository shelterAddressRepository;
    private final PetAddressRepository petAddressRepository;
    private final ImageService imageService;
    private final PasswordEncoder passwordEncoder;
    private final StorageService storageService;

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
    public void enablePostgresExtensions() {
        // Enable the cube extension (required for earthdistance)
        entityManager.createNativeQuery("CREATE EXTENSION IF NOT EXISTS cube").executeUpdate();

        // Enable the earthdistance extension
        entityManager.createNativeQuery("CREATE EXTENSION IF NOT EXISTS earthdistance").executeUpdate();
    }

    @Transactional
    public void clearDatabase() {
        // First break all relationships using native queries
        entityManager
                .createNativeQuery("UPDATE \"user\" SET avatar_image_id = NULL")
                .executeUpdate();

        entityManager
                .createNativeQuery("UPDATE \"shelter\" SET avatar_image_id = NULL")
                .executeUpdate();

        // Delete all favorites first
        entityManager
                .createNativeQuery("DELETE FROM \"favorite\"")
                .executeUpdate();

        // Delete all messages
        entityManager
                .createNativeQuery("DELETE FROM \"message\"")
                .executeUpdate();

        // Delete all shelter members
        entityManager
                .createNativeQuery("DELETE FROM \"shelter_member\"")
                .executeUpdate();

        // Delete all pet images first
        entityManager
                .createNativeQuery("DELETE FROM \"pet_image\"")
                .executeUpdate();

        // Delete all pet addresses and shelter addresses
        entityManager
                .createNativeQuery("DELETE FROM \"pet_address\"")
                .executeUpdate();

        entityManager
                .createNativeQuery("DELETE FROM \"shelter_address\"")
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
                System.err.println("Failed to delete S3 image: " + image.getKey() + " - "
                        + e.getMessage());
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
        // Initialize S3 bucket first
        try {
            storageService.initBucket();
        } catch (Exception e) {
            System.err.println("Warning: Failed to initialize S3 bucket. Image uploads may not work properly.");
            e.printStackTrace();
        }

        try {
            // Enable PostgreSQL extensions first
            enablePostgresExtensions();
        } catch (Exception e) {
            System.err.println(
                    "Warning: Failed to enable PostgreSQL extensions. Distance-based sorting may not work.");
            e.printStackTrace();
        }

        // Only seed if the database is empty
        if (userRepository.count() > 0) {
            return;
        }

        // Create John Doe user
        User johnDoe = User.builder()
                .firstName("John")
                .lastName("Doe")
                .username("johndoe")
                .email("johndoe@example.com")
                .passwordHash(passwordEncoder.encode("Johndoe12"))
                .createdAt(LocalDateTime.now())
                .build();
        johnDoe = userRepository.save(johnDoe);

        // Add avatar for John Doe
        Image johnDoeAvatar = uploadSampleImage(SAMPLE_AVATAR_IMAGES[0], "avatars");
        AvatarImage johnDoeAvatarImage = AvatarImage.builder()
                .imageId(johnDoeAvatar.getId())
                .build();
        johnDoeAvatarImage = avatarImageRepository.save(johnDoeAvatarImage);
        johnDoe.setAvatarImageId(johnDoeAvatarImage.getId());
        johnDoe = userRepository.save(johnDoe);

        // Create John's first shelter
        Shelter shelter1 = Shelter.builder()
                .name("Happy Paws Shelter")
                .description("A loving shelter for pets in need")
                .phone("+1-555-123-4567")
                .email("contact@happypaws.com")
                .website("www.happypaws.com")
                .ownerId(johnDoe.getId())
                .createdAt(LocalDateTime.now())
                .build();
        shelter1 = shelterRepository.save(shelter1);

        // Create address for first shelter
        Address address1 = Address.builder()
                .address1("123 Main St")
                .city("New York")
                .region("NY")
                .postalCode("10001")
                .country("United States")
                .lat(40.7128)
                .lng(-74.0060)
                .createdAt(LocalDateTime.now())
                .build();
        address1.setFormattedAddress("123 Main St, New York, NY 10001");
        address1 = addressRepository.save(address1);

        // Create shelter address relationship
        ShelterAddress shelterAddress1 = ShelterAddress.builder()
                .shelterId(shelter1.getId())
                .addressId(address1.getId())
                .build();
        shelterAddress1 = shelterAddressRepository.save(shelterAddress1);
        shelter1.setShelterAddress(shelterAddress1);
        shelter1 = shelterRepository.save(shelter1);

        // Create John's second shelter
        Shelter shelter2 = Shelter.builder()
                .name("Furry Friends Haven")
                .description("Where pets find their forever homes")
                .phone("+1-555-987-6543")
                .email("contact@furryfriends.com")
                .website("www.furryfriends.com")
                .ownerId(johnDoe.getId())
                .createdAt(LocalDateTime.now())
                .build();
        shelter2 = shelterRepository.save(shelter2);

        // Create address for second shelter
        Address address2 = Address.builder()
                .address1("456 Park Ave")
                .city("Los Angeles")
                .region("CA")
                .postalCode("90001")
                .country("United States")
                .lat(34.0522)
                .lng(-118.2437)
                .createdAt(LocalDateTime.now())
                .build();
        address2.setFormattedAddress("456 Park Ave, Los Angeles, CA 90001");
        address2 = addressRepository.save(address2);

        // Create shelter address relationship
        ShelterAddress shelterAddress2 = ShelterAddress.builder()
                .shelterId(shelter2.getId())
                .addressId(address2.getId())
                .build();
        shelterAddress2 = shelterAddressRepository.save(shelterAddress2);
        shelter2.setShelterAddress(shelterAddress2);
        shelter2 = shelterRepository.save(shelter2);

        // Create 3 pets for first shelter
        for (int i = 0; i < 3; i++) {
            createPet(johnDoe.getId(), shelter1.getId(), true);
        }

        // Create 6 pets for second shelter
        for (int i = 0; i < 6; i++) {
            createPet(johnDoe.getId(), shelter2.getId(), true);
        }

        // Create 11 user pets (no shelter)
        for (int i = 0; i < 11; i++) {
            createPet(johnDoe.getId(), null, false);
        }

        // Continue with random data generation
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
                Image avatarImage = uploadSampleImage(
                        SAMPLE_AVATAR_IMAGES[random.nextInt(SAMPLE_AVATAR_IMAGES.length)],
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
                    .email("contact@" + shelterName.toLowerCase().replaceAll("[^a-z0-9]", "")
                            + ".com")
                    .website("www." + shelterName.toLowerCase().replaceAll("[^a-z0-9]", "")
                            + ".com")
                    .ownerId(owner.getId())
                    .createdAt(LocalDateTime.now().minusDays(random.nextInt(365)))
                    .build();
            shelter = shelterRepository.save(shelter);

            // Add avatar to shelter
            if (random.nextDouble() < 0.8) { // 80% chance of having an avatar
                Image avatarImage = uploadSampleImage(
                        SAMPLE_AVATAR_IMAGES[random.nextInt(SAMPLE_AVATAR_IMAGES.length)],
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
                    address.getAddress1(), address.getCity(), address.getRegion(),
                    address.getPostalCode()));
            address = addressRepository.save(address);

            // Create shelter address relationship
            ShelterAddress shelterAddress = ShelterAddress.builder()
                    .shelterId(shelter.getId())
                    .addressId(address.getId())
                    .build();
            shelterAddress = shelterAddressRepository.save(shelterAddress);
            shelter.setShelterAddress(shelterAddress);
            shelter = shelterRepository.save(shelter);

            shelters.add(shelter);
        }

        // Create 150 random pets
        for (int i = 0; i < 150; i++) {
            User creator = users.get(random.nextInt(users.size()));
            Shelter shelter = random.nextDouble() < 0.8 ? shelters.get(random.nextInt(shelters.size()))
                    : null;
            createPet(creator.getId(), shelter != null ? shelter.getId() : null, false);
        }
    }

    private Pet createPet(UUID creatorId, UUID shelterId, boolean isJohnDoePet) {
        boolean isDog = random.nextBoolean();
        String species = isDog ? "Dog" : "Cat";
        String breed = isDog ? faker.dog().breed() : faker.cat().breed();
        int ageInMonths = random.nextInt(120) + 1;

        Pet pet = Pet.builder()
                .name(faker.dog().name())
                .description(generatePetDescription(species, breed, ageInMonths))
                .species(species)
                .breed(breed)
                .gender(random.nextBoolean() ? "Male" : "Female")
                .birthDate(LocalDate.now().minusMonths(ageInMonths))
                .status(PetStatus.AVAILABLE)
                .createdByUserId(creatorId)
                .shelterId(shelterId)
                .createdAt(LocalDateTime.now().minusDays(random.nextInt(365)))
                .build();
        pet = petRepository.save(pet);

        // Create address for user pets (not shelter pets)
        if (shelterId == null) {
            Address address = Address.builder()
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
                    address.getAddress1(), address.getCity(), address.getRegion(),
                    address.getPostalCode()));
            address = addressRepository.save(address);

            PetAddress petAddress = PetAddress.builder()
                    .petId(pet.getId())
                    .addressId(address.getId())
                    .build();
            petAddress = petAddressRepository.save(petAddress);
            pet.setPetAddress(petAddress);
            pet = petRepository.save(pet);
        }

        // Add 1-3 images for each pet
        int numImages = random.nextInt(3) + 1;
        boolean setPrimary = true;
        List<PetImage> petImages = new ArrayList<>();
        for (int j = 0; j < numImages; j++) {
            String[] imagePool = isDog
                    ? Arrays.stream(SAMPLE_PET_IMAGES).filter(img -> img.contains("dog"))
                            .toArray(String[]::new)
                    : Arrays.stream(SAMPLE_PET_IMAGES).filter(img -> img.contains("cat"))
                            .toArray(String[]::new);

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

        petImageRepository.saveAll(petImages);
        return pet;
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