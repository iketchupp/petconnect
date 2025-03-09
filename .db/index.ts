import { AdoptionStatus, PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

function getRandomEnumValue<T>(enumObj: { [key: string]: T }): T {
  const values = Object.values(enumObj);
  return values[Math.floor(Math.random() * values.length)];
}

async function generateDummyData() {
  try {
    // Generate 5 images first
    const images = await Promise.all(
      Array(5)
        .fill(null)
        .map(async () => {
          return await prisma.image.create({
            data: {
              url: faker.image.url(),
              key: faker.string.uuid(),
              bucket: "my-bucket",
              contentType: "image/jpeg",
              size: faker.number.int({ min: 1000, max: 5000000 }),
            },
          });
        })
    );

    // Generate 10 users
    const users = await Promise.all(
      Array(10)
        .fill(null)
        .map(async () => {
          return await prisma.user.create({
            data: {
              firstName: faker.person.firstName(),
              lastName: faker.person.lastName(),
              username: faker.internet.userName(),
              email: faker.internet.email(),
              password: faker.internet.password(),
              avatarId: faker.helpers.arrayElement([
                ...images.map((img) => img.id),
                null,
              ]),
            },
          });
        })
    );

    // Generate 5 shelters
    const shelters = await Promise.all(
      Array(5)
        .fill(null)
        .map(async () => {
          return await prisma.shelter.create({
            data: {
              name: faker.company.name(),
              address: faker.location.streetAddress(),
              city: faker.location.city(),
              state: faker.location.state(),
              zipCode: faker.location.zipCode(),
              phone: faker.phone.number(),
              email: faker.internet.email(),
              website: faker.internet.url(),
              imageId: faker.helpers.arrayElement([
                ...images.map((img) => img.id),
                null,
              ]),
              ownerId: faker.helpers.arrayElement([
                ...users.map((user) => user.id),
                null,
              ]),
            },
          });
        })
    );

    // Generate 20 pets
    const pets = await Promise.all(
      Array(20)
        .fill(null)
        .map(async () => {
          const pet = await prisma.pet.create({
            data: {
              name: faker.person.firstName(),
              species: faker.helpers.arrayElement([
                "Dog",
                "Cat",
                "Bird",
                "Rabbit",
              ]),
              breed: faker.lorem.word(),
              gender: faker.helpers.arrayElement(["Male", "Female"]),
              birthDate: faker.date.past({ years: 5 }),
              size: faker.helpers.arrayElement(["Small", "Medium", "Large"]),
              color: faker.color.human(),
              description: faker.lorem.paragraph(),
              adoptionStatus: getRandomEnumValue(AdoptionStatus),
              ownerId: faker.helpers.arrayElement([
                ...users.map((user) => user.id),
                null,
              ]),
              shelterId: faker.helpers.arrayElement([
                ...shelters.map((shelter) => shelter.id),
                null,
              ]),
            },
          });

          // Add random images to pets
          await prisma.pet.update({
            where: { id: pet.id },
            data: {
              images: {
                connect: faker.helpers
                  .arrayElements(images, faker.number.int({ min: 1, max: 3 }))
                  .map((img: { id: string }) => ({ id: img.id })),
              },
            },
          });

          return pet;
        })
    );

    // Generate 15 bookmarks
    await Promise.all(
      Array(15)
        .fill(null)
        .map(async () => {
          return await prisma.bookmark.create({
            data: {
              userId: faker.helpers.arrayElement(users.map((user) => user.id)),
              petId: faker.helpers.arrayElement(pets.map((pet) => pet.id)),
            },
          });
        })
    );

    // Generate 30 messages
    await Promise.all(
      Array(30)
        .fill(null)
        .map(async () => {
          const isShelterSender = faker.datatype.boolean();
          const isShelterReceiver = faker.datatype.boolean();

          return await prisma.message.create({
            data: {
              content: faker.lorem.paragraph(),
              senderUserId: isShelterSender
                ? null
                : faker.helpers.arrayElement(users.map((user) => user.id)),
              senderShelterId: isShelterSender
                ? faker.helpers.arrayElement(
                    shelters.map((shelter) => shelter.id)
                  )
                : null,
              receiverUserId: isShelterReceiver
                ? null
                : faker.helpers.arrayElement(users.map((user) => user.id)),
              receiverShelterId: isShelterReceiver
                ? faker.helpers.arrayElement(
                    shelters.map((shelter) => shelter.id)
                  )
                : null,
              petId: faker.helpers.arrayElement([
                ...pets.map((pet) => pet.id),
                null,
              ]),
            },
          });
        })
    );

    console.log("Dummy data generated successfully!");
  } catch (error) {
    console.error("Error generating dummy data:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the generator
generateDummyData();
