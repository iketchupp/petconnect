import { Pet, PetsResponse, User } from '@/types/api';
import { http } from '@/lib/http';

export type PetFilters = {
  species?: string;
  breed?: string;
  age?: string;
  size?: string;
  gender?: string;
  searchQuery?: string;
  sortBy?: 'newest' | 'oldest' | 'name_asc' | 'name_desc';
};

export async function getPets(cursor?: string, filters?: PetFilters, limit: number = 12): Promise<PetsResponse> {
  try {
    const params: Record<string, string> = { limit: limit.toString() };

    if (cursor) params.cursor = cursor;
    if (filters?.species) params.species = filters.species;
    if (filters?.breed) params.breed = filters.breed;
    if (filters?.age) params.age = filters.age;
    if (filters?.size) params.size = filters.size;
    if (filters?.gender) params.gender = filters.gender;
    if (filters?.searchQuery) params.search = filters.searchQuery;
    if (filters?.sortBy) params.sortBy = filters.sortBy;

    const response = await http.get('/pets', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching pets:', error);
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

export async function getPetIsBookmarked(petId: string) {
  try {
    const response = await http.get(`/bookmarks/${petId}`);

    return response.data;
  } catch (error) {
    console.error('Error fetching pet owner bookmarked:', error);
    throw error;
  }
}

export async function bookmarkPet(petId: string) {
  try {
    const response = await http.post(`/bookmarks/${petId}`);

    return response.data;
  } catch (error) {
    console.error('Error bookmarking pet:', error);
    throw error;
  }
}

export async function unBookmarkPet(petId: string) {
  try {
    const response = await http.delete(`/bookmarks/${petId}`);

    return response.data;
  } catch (error) {
    console.error('Error unbookmarking pet:', error);
    throw error;
  }
}
