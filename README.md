# PetConnect

## Database Entity Relation Diagram

```mermaid
erDiagram
    User ||--o{ Shelter : owns
    User ||--o{ Pet : creates
    User ||--o{ Favorite : has
    User ||--o{ Message : sends
    User }|--o{ Message : receives
    User ||--o| AvatarImage : has

    Shelter ||--o{ Pet : houses
    Shelter ||--o{ Message : receives
    Shelter ||--o| AvatarImage : has
    Shelter ||--o| ShelterAddress : has

    Pet ||--o{ PetImage : has
    Pet ||--o{ Favorite : "is bookmarked in"
    Pet ||--o| PetAddress : has
    Pet ||--o{ Message : references

    Image ||--o| AvatarImage : "used in"
    Image ||--o| PetImage : "used in"

    Address ||--o| ShelterAddress : "used in"
    Address ||--o| PetAddress : "used in"

    User {
        UUID id PK
        String firstName
        String lastName
        String username UK
        String email UK
        String passwordHash
        UUID avatarImageId FK
        ZonedDateTime createdAt
    }

    Shelter {
        UUID id PK
        String name
        String description
        String phone
        String email
        String website
        UUID ownerId FK
        UUID avatarImageId FK
        ZonedDateTime createdAt
    }

    Pet {
        UUID id PK
        String name
        String description
        String species
        String breed
        String gender
        LocalDate birthDate
        PetStatus status
        UUID createdByUserId FK
        UUID shelterId FK
        ZonedDateTime createdAt
    }

    Address {
        UUID id PK
        String address1
        String address2
        String formattedAddress
        String city
        String region
        String postalCode
        String country
        Double lat
        Double lng
        ZonedDateTime createdAt
    }

    Image {
        UUID id PK
        String key UK
        String bucket
        String fileType
        Long fileSize
        ZonedDateTime uploadedAt
    }

    AvatarImage {
        UUID id PK
        UUID imageId FK
        ZonedDateTime createdAt
    }

    PetImage {
        UUID id PK
        UUID petId FK
        UUID imageId FK
        Boolean isPrimary
        ZonedDateTime createdAt
    }

    Favorite {
        UUID userId PK,FK
        UUID petId PK,FK
        ZonedDateTime createdAt
    }

    Message {
        UUID id PK
        UUID senderId FK
        UUID receiverId FK
        String content
        Boolean isRead
        UUID shelterId FK
        UUID petId FK
        ZonedDateTime sentAt
    }

    ShelterAddress {
        UUID id PK
        UUID shelterId FK
        UUID addressId FK
        ZonedDateTime createdAt
    }

    PetAddress {
        UUID id PK
        UUID petId FK
        UUID addressId FK
        ZonedDateTime createdAt
    }
```
