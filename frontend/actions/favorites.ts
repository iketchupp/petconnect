import { PetsResponse } from '@/types/api';
import { http } from '@/lib/http';

export async function getPetIsFavorited(petId: string) {
  try {
    const response = await http.get(`/favorites/${petId}`);

    return response.data;
  } catch (error) {
    console.error('Error fetching pet owner favorited:', error);
    throw error;
  }
}

export async function favoritePet(petId: string) {
  try {
    const response = await http.post(`/favorites/${petId}`);

    return response.data;
  } catch (error) {
    console.error('Error favoriting pet:', error);
    throw error;
  }
}

export async function unFavoritePet(petId: string) {
  try {
    const response = await http.delete(`/favorites/${petId}`);

    return response.data;
  } catch (error) {
    console.error('Error unfavoriting pet:', error);
    throw error;
  }
}

export async function getFavoritedPets(cursor?: string, limit: number = 12): Promise<PetsResponse> {
  try {
    const params: Record<string, string> = { limit: limit.toString() };

    if (cursor) params.cursor = cursor;

    const response = await http.get('/favorites', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching favorited pets:', error);
    throw error;
  }
}
