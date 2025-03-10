import { PrismaClient, PetStatus } from "@prisma/client";
import { faker } from "@faker-js/faker";
import { hash } from "bcrypt";

const prisma = new PrismaClient();

// Helper function to generate a random item from an array
const randomItem = <T>(array: T[]): T =>
  array[Math.floor(Math.random() * array.length)];

// Helper function to get random items from an array
const getRandomItems = <T>(array: T[], min: number, max: number): T[] => {
  const count = faker.number.int({ min, max });
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

async function main() {
  console.log("🌱 Starting seeding...");

  // Create Images first (for avatar and pet images)
  console.log("Creating images...");
  const images = await Promise.all(
    Array(30)
      .fill(null)
      .map(async () => {
        return prisma.image.create({
          data: {
            url: faker.image.url(),
            key: faker.string.uuid(),
            bucket: "petconnect-images",
            fileType: faker.helpers.arrayElement(["image/jpeg", "image/png"]),
            fileSize: faker.number.int({ min: 100000, max: 5000000 }),
          },
        });
      })
  );

  // Create Avatar Images
  console.log("Creating avatar images...");
  const avatarImages = await Promise.all(
    images.slice(0, 15).map(async (image) => {
      return prisma.avatarImage.create({
        data: {
          imageId: image.id,
        },
      });
    })
  );

  // Create Users
  console.log("Creating users...");
  const users = await Promise.all(
    Array(20)
      .fill(null)
      .map(async (_, index) => {
        const avatarImage = index < 10 ? avatarImages[index] : null;
        return prisma.user.create({
          data: {
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
            username: faker.internet.username(),
            email: faker.internet.email(),
            passwordHash: await hash("password123", 10),
            avatarImageId: avatarImage?.id,
          },
        });
      })
  );

  // Create Shelters
  console.log("Creating shelters...");
  const shelters = await Promise.all(
    Array(10)
      .fill(null)
      .map(async (_, index) => {
        const avatarImage = avatarImages[index + 10];
        const lat = Number(faker.location.latitude());
        const lng = Number(faker.location.longitude());

        return prisma.shelter.create({
          data: {
            name: faker.company.name(),
            description: faker.company.catchPhrase(),
            phone: faker.phone.number(),
            email: faker.internet.email(),
            website: faker.internet.url(),
            ownerId: users[index].id,
            avatarImageId: avatarImage?.id,
            address: {
              create: {
                address1: faker.location.streetAddress(),
                address2: faker.location.secondaryAddress(),
                formattedAddress: faker.location.streetAddress(true),
                city: faker.location.city(),
                region: faker.location.state(),
                postalCode: faker.location.zipCode(),
                country: faker.location.country(),
                lat,
                lng,
              },
            },
          },
        });
      })
  );

  // Create Shelter Members
  console.log("Creating shelter members...");
  await Promise.all(
    shelters.map(async (shelter) => {
      const memberCount = faker.number.int({ min: 2, max: 5 });
      const members = getRandomItems(users, memberCount, memberCount);
      return Promise.all(
        members.map(async (user) => {
          return prisma.shelterMember.create({
            data: {
              shelterId: shelter.id,
              userId: user.id,
            },
          });
        })
      );
    })
  );

  // Create Pets
  console.log("Creating pets...");
  const petSpecies = ["Dog", "Cat", "Rabbit", "Bird", "Hamster"];
  const petStatus = [PetStatus.AVAILABLE, PetStatus.ADOPTED, PetStatus.PENDING];
  const pets = await Promise.all(
    Array(30)
      .fill(null)
      .map(async () => {
        const species = randomItem(petSpecies);
        const shelter = randomItem(shelters);
        const creator = randomItem(users);

        return prisma.pet.create({
          data: {
            name: faker.animal.dog(),
            description: faker.lorem.paragraph(),
            species,
            breed: faker.animal.dog(),
            gender: faker.person.sex(),
            birthDate: faker.date.past(),
            status: randomItem(petStatus),
            createdByUserId: creator.id,
            shelterId: shelter.id,
          },
        });
      })
  );

  // Create Pet Images
  console.log("Creating pet images...");
  await Promise.all(
    pets.map(async (pet) => {
      const imageCount = faker.number.int({ min: 1, max: 3 });

      // Create new images for each pet
      const petImages = await Promise.all(
        Array(imageCount)
          .fill(null)
          .map(async () => {
            return prisma.image.create({
              data: {
                url: faker.image.url(),
                key: faker.string.uuid(),
                bucket: "petconnect-images",
                fileType: faker.helpers.arrayElement([
                  "image/jpeg",
                  "image/png",
                ]),
                fileSize: faker.number.int({ min: 100000, max: 5000000 }),
              },
            });
          })
      );

      return Promise.all(
        petImages.map(async (image, index) => {
          return prisma.petImage.create({
            data: {
              petId: pet.id,
              imageId: image.id,
              isPrimary: index === 0,
            },
          });
        })
      );
    })
  );

  // Create Bookmarks
  console.log("Creating bookmarks...");
  await Promise.all(
    users.map(async (user) => {
      const bookmarkedPets = getRandomItems(pets, 1, 5);
      return Promise.all(
        bookmarkedPets.map(async (pet) => {
          return prisma.bookmark.create({
            data: {
              userId: user.id,
              petId: pet.id,
            },
          });
        })
      );
    })
  );

  // Create Messages
  console.log("Creating messages...");
  const messages = await Promise.all(
    Array(40)
      .fill(null)
      .map(async () => {
        const sender = randomItem(users);
        const receiver = randomItem(users.filter((u) => u.id !== sender.id));
        const shelter = Math.random() > 0.5 ? randomItem(shelters) : null;

        return prisma.message.create({
          data: {
            senderId: sender.id,
            receiverId: receiver.id,
            content: faker.lorem.paragraph(),
            isRead: faker.datatype.boolean(),
            shelterId: shelter?.id,
          },
        });
      })
  );

  // Create Message Assignments
  console.log("Creating message assignments...");
  await Promise.all(
    messages
      .filter(() => Math.random() > 0.7)
      .map(async (message) => {
        const assignedUser = randomItem(users);
        return prisma.shelterMessageAssignment.create({
          data: {
            messageId: message.id,
            userId: assignedUser.id,
          },
        });
      })
  );

  console.log("✅ Seeding completed!");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
