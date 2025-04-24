import { CreatePetData, Pet, PetsResponse, User } from '@/types/api';
import { http } from '@/lib/http';

export type PetFilters = {
  species?: string;
  breed?: string;
  ageRange?: {
    min: number;
    max: number;
  };
  gender?: string;
  searchQuery?: string;
  sortBy?: 'newest' | 'oldest' | 'name_asc' | 'name_desc' | 'youngest' | 'eldest' | 'distance';
  latitude?: number;
  longitude?: number;
  country?: string;
  city?: string;
};

export async function getPets(cursor?: string, filters?: PetFilters, limit: number = 12): Promise<PetsResponse> {
  try {
    const params: Record<string, string> = { limit: limit.toString() };

    if (cursor) params.cursor = cursor;
    if (filters?.species) params.species = filters.species;
    if (filters?.breed) params.breed = filters.breed;
    if (filters?.ageRange) {
      params.minAge = filters.ageRange.min.toString();
      params.maxAge = filters.ageRange.max.toString();
    }
    if (filters?.gender) params.gender = filters.gender;
    if (filters?.searchQuery) params.search = filters.searchQuery;
    if (filters?.sortBy) params.sortBy = filters.sortBy;
    if (filters?.latitude) params.lat = filters.latitude.toString();
    if (filters?.longitude) params.lng = filters.longitude.toString();
    if (filters?.country) params.country = filters.country;
    if (filters?.city) params.city = filters.city;

    const response = await http.get('/pets', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching pets:', error);
    throw error;
  }
}

export async function getPetById(petId: string): Promise<Pet> {
  try {
    const response = await http.get(`/pets/${petId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching pet by ID:', error);
    throw error;
  }
}

export async function getPetOwner(petId: string): Promise<User> {
  try {
    const response = await http.get(`/pets/${petId}/owner`);

    return response.data;
  } catch (error) {
    console.error('Error fetching pet owner:', error);
    throw error;
  }
}

export async function getUserPets(cursor?: string, limit: number = 12): Promise<PetsResponse> {
  try {
    const params: Record<string, string> = { limit: limit.toString() };

    if (cursor) params.cursor = cursor;

    const response = await http.get('/user/me/pets', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching user pets:', error);
    throw error;
  }
}

export async function createPet(data: CreatePetData): Promise<Pet> {
  try {
    const response = await http.post('/pets', data);
    return response.data;
  } catch (error) {
    console.error('Error creating pet:', error);
    throw error;
  }
}

export async function uploadPetImages(petId: string, images: File[]): Promise<Pet> {
  try {
    const formData = new FormData();
    images.forEach((image) => {
      formData.append('files', image);
    });

    const response = await http.post(`/pets/${petId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading pet images:', error);
    throw error;
  }
}

export async function getPetSpecies(): Promise<string[]> {
  try {
    const response = await http.get('/pets/species');
    return response.data;
  } catch (error) {
    console.error('Error fetching pet species:', error);
    throw error;
  }
}

export async function getPetGenders(): Promise<string[]> {
  try {
    const response = await http.get('/pets/genders');
    return response.data;
  } catch (error) {
    console.error('Error fetching pet genders:', error);
    throw error;
  }
}

export async function getPetBreeds(species?: string): Promise<string[]> {
  try {
    const params: Record<string, string> = {};
    if (species) params.species = species;

    const response = await http.get('/pets/breeds', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching pet breeds:', error);
    throw error;
  }
}

export async function getPetAddress(petId: string) {
  try {
    const response = await http.get(`/pets/${petId}/address`);
    return response.data;
  } catch (error) {
    console.error('Error fetching pet address:', error);
    throw error;
  }
}

export async function getPetFullAddress(petId: string) {
  try {
    const response = await http.get(`/pets/${petId}/full-address`);
    return response.data;
  } catch (error) {
    console.error('Error fetching pet full address:', error);
    throw error;
  }
}

export async function deletePet(petId: string) {
  try {
    const response = await http.delete(`/pets/${petId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting pet:', error);
    throw error;
  }
}
