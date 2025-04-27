package org.petconnect.backend.config;

import java.io.IOException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
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
import org.petconnect.backend.util.DateTimeUtil;
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

    // Define country data with lat/lng bounds and address formats
    private static final List<Map<String, Object>> COUNTRIES = List.of(
            Map.of(
                    "name", "United States",
                    "code", "US",
                    "minLat", 24.0, "maxLat", 49.0,
                    "minLng", -125.0, "maxLng", -66.0,
                    "cities", List.of("New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego", "Dallas", "Austin"),
                    "regions", List.of("NY", "CA", "TX", "FL", "IL", "PA", "OH", "GA", "NC", "MI"),
                    "postalFormat", "\\d{5}"
            ),
            Map.of(
                    "name", "Canada",
                    "code", "CA",
                    "minLat", 42.0, "maxLat", 57.0,
                    "minLng", -141.0, "maxLng", -52.0,
                    "cities", List.of("Toronto", "Montreal", "Vancouver", "Calgary", "Edmonton", "Ottawa", "Winnipeg", "Quebec City", "Hamilton", "Kitchener"),
                    "regions", List.of("ON", "QC", "BC", "AB", "MB", "SK", "NS", "NB", "NL", "PE"),
                    "postalFormat", "[A-Z]\\d[A-Z] \\d[A-Z]\\d"
            ),
            Map.of(
                    "name", "United Kingdom",
                    "code", "UK",
                    "minLat", 49.0, "maxLat", 59.0,
                    "minLng", -8.0, "maxLng", 2.0,
                    "cities", List.of("London", "Birmingham", "Manchester", "Glasgow", "Liverpool", "Bristol", "Edinburgh", "Cardiff", "Leeds", "Newcastle"),
                    "regions", List.of("England", "Scotland", "Wales", "Northern Ireland"),
                    "postalFormat", "[A-Z]{1,2}\\d[A-Z\\d]? \\d[A-Z]{2}"
            ),
            Map.of(
                    "name", "Australia",
                    "code", "AU",
                    "minLat", -43.0, "maxLat", -10.0,
                    "minLng", 113.0, "maxLng", 154.0,
                    "cities", List.of("Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Gold Coast", "Canberra", "Newcastle", "Wollongong", "Hobart"),
                    "regions", List.of("NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"),
                    "postalFormat", "\\d{4}"
            ),
            Map.of(
                    "name", "Germany",
                    "code", "DE",
                    "minLat", 47.0, "maxLat", 55.0,
                    "minLng", 5.0, "maxLng", 15.0,
                    "cities", List.of("Berlin", "Hamburg", "Munich", "Cologne", "Frankfurt", "Stuttgart", "Düsseldorf", "Leipzig", "Dortmund", "Essen"),
                    "regions", List.of("Bavaria", "North Rhine-Westphalia", "Baden-Württemberg", "Lower Saxony", "Hesse", "Saxony", "Rhineland-Palatinate", "Berlin", "Schleswig-Holstein", "Brandenburg"),
                    "postalFormat", "\\d{5}"
            ),
            Map.of(
                    "name", "Japan",
                    "code", "JP",
                    "minLat", 30.0, "maxLat", 46.0,
                    "minLng", 129.0, "maxLng", 146.0,
                    "cities", List.of("Tokyo", "Yokohama", "Osaka", "Nagoya", "Sapporo", "Kobe", "Kyoto", "Fukuoka", "Kawasaki", "Saitama"),
                    "regions", List.of("Tokyo", "Kanagawa", "Osaka", "Aichi", "Hokkaido", "Hyogo", "Kyoto", "Fukuoka", "Saitama", "Chiba"),
                    "postalFormat", "\\d{3}-\\d{4}"
            ),
            Map.of(
                    "name", "Brazil",
                    "code", "BR",
                    "minLat", -33.0, "maxLat", 5.0,
                    "minLng", -74.0, "maxLng", -34.0,
                    "cities", List.of("São Paulo", "Rio de Janeiro", "Brasília", "Salvador", "Fortaleza", "Belo Horizonte", "Manaus", "Curitiba", "Recife", "Porto Alegre"),
                    "regions", List.of("São Paulo", "Rio de Janeiro", "Distrito Federal", "Bahia", "Ceará", "Minas Gerais", "Amazonas", "Paraná", "Pernambuco", "Rio Grande do Sul"),
                    "postalFormat", "\\d{5}-\\d{3}"
            ),
            Map.of(
                    "name", "South Africa",
                    "code", "ZA",
                    "minLat", -34.0, "maxLat", -22.0,
                    "minLng", 16.0, "maxLng", 33.0,
                    "cities", List.of("Johannesburg", "Cape Town", "Durban", "Pretoria", "Port Elizabeth", "Bloemfontein", "East London", "Kimberley", "Pietermaritzburg", "Polokwane"),
                    "regions", List.of("Gauteng", "Western Cape", "KwaZulu-Natal", "Eastern Cape", "Free State", "North West", "Mpumalanga", "Limpopo", "Northern Cape"),
                    "postalFormat", "\\d{4}"
            )
    );

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

    @SuppressWarnings("unchecked")
    private Map<String, Object> getRandomCountry() {
        return (Map<String, Object>) COUNTRIES.get(random.nextInt(COUNTRIES.size()));
    }

    @SuppressWarnings("unchecked")
    private Address createRandomAddress(Map<String, Object> country) {
        double minLat = (double) country.get("minLat");
        double maxLat = (double) country.get("maxLat");
        double minLng = (double) country.get("minLng");
        double maxLng = (double) country.get("maxLng");

        List<String> cities = (List<String>) country.get("cities");
        List<String> regions = (List<String>) country.get("regions");

        String city = cities.get(random.nextInt(cities.size()));
        String region = regions.get(random.nextInt(regions.size()));

        String postalCode;
        if (country.get("name").equals("United Kingdom")) {
            postalCode = faker.regexify("[A-Z]{1,2}\\d[A-Z\\d]? \\d[A-Z]{2}");
        } else if (country.get("name").equals("Canada")) {
            postalCode = faker.regexify("[A-Z]\\d[A-Z] \\d[A-Z]\\d");
        } else if (country.get("name").equals("Japan")) {
            postalCode = faker.regexify("\\d{3}-\\d{4}");
        } else if (country.get("name").equals("Brazil")) {
            postalCode = faker.regexify("\\d{5}-\\d{3}");
        } else {
            postalCode = faker.regexify("\\d{5}");
        }

        // Generate random lat/lng within country bounds
        double lat = minLat + (maxLat - minLat) * random.nextDouble();
        double lng = minLng + (maxLng - minLng) * random.nextDouble();

        Address address = Address.builder()
                .address1(faker.address().streetAddress())
                .city(city)
                .region(region)
                .postalCode(postalCode)
                .country((String) country.get("name"))
                .lat(lat)
                .lng(lng)
                .createdAt(DateTimeUtil.nowUTC().minusDays(random.nextInt(365)))
                .build();

        // Format address according to country convention
        String formattedAddress;
        if (country.get("name").equals("United Kingdom")) {
            formattedAddress = String.format("%s, %s, %s, %s",
                    address.getAddress1(), address.getCity(), address.getRegion(), address.getPostalCode());
        } else if (country.get("name").equals("Japan")) {
            formattedAddress = String.format("%s, %s %s, %s",
                    address.getPostalCode(), address.getRegion(), address.getCity(), address.getAddress1());
        } else {
            formattedAddress = String.format("%s, %s, %s %s, %s",
                    address.getAddress1(), address.getCity(), address.getRegion(),
                    address.getPostalCode(), address.getCountry());
        }

        address.setFormattedAddress(formattedAddress);
        return address;
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

        System.out.println("Seeding data...");

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
                .createdAt(DateTimeUtil.nowUTC())
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
                .createdAt(DateTimeUtil.nowUTC())
                .build();
        shelter1 = shelterRepository.save(shelter1);

        // Create address for first shelter - USA
        Map<String, Object> usaCountry = COUNTRIES.stream()
                .filter(c -> c.get("name").equals("United States"))
                .findFirst()
                .orElse(getRandomCountry());

        Address address1 = Address.builder()
                .address1("123 Main St")
                .city("New York")
                .region("NY")
                .postalCode("10001")
                .country((String) usaCountry.get("name"))
                .lat(40.7128)
                .lng(-74.0060)
                .createdAt(DateTimeUtil.nowUTC())
                .build();
        address1.setFormattedAddress("123 Main St, New York, NY 10001, United States");
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
                .createdAt(DateTimeUtil.nowUTC())
                .build();
        shelter2 = shelterRepository.save(shelter2);

        // Create address for second shelter - UK
        Map<String, Object> ukCountry = COUNTRIES.stream()
                .filter(c -> c.get("name").equals("United Kingdom"))
                .findFirst()
                .orElse(getRandomCountry());

        Address address2 = Address.builder()
                .address1("45 Abbey Road")
                .city("London")
                .region("England")
                .postalCode("NW8 9AY")
                .country((String) ukCountry.get("name"))
                .lat(51.532)
                .lng(-0.177)
                .createdAt(DateTimeUtil.nowUTC())
                .build();
        address2.setFormattedAddress("45 Abbey Road, London, England, NW8 9AY, United Kingdom");
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
                    .createdAt(DateTimeUtil.nowUTC().minusDays(random.nextInt(365)))
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
                    .createdAt(DateTimeUtil.nowUTC().minusDays(random.nextInt(365)))
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

            // Create address for shelter with random country
            Map<String, Object> country = getRandomCountry();
            Address address = createRandomAddress(country);
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
                .createdAt(DateTimeUtil.nowUTC().minusDays(random.nextInt(365)))
                .build();
        pet = petRepository.save(pet);

        // Create address for user pets (not shelter pets)
        if (shelterId == null) {
            Map<String, Object> country = getRandomCountry();
            Address address = createRandomAddress(country);
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
                    .createdAt(DateTimeUtil.nowUTC())
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
