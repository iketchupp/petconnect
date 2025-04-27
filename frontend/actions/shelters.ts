import { CreateShelterData, Shelter, SheltersResponse } from '@/types/api';
import { PetsResponse } from '@/types/api/pet';
import { User } from '@/types/api/user';
import { http } from '@/lib/http';
import { ShelterFilters } from '@/components/shelters/shelter-filters/types';

export async function getShelters(
  cursor?: string,
  filters?: ShelterFilters,
  limit: number = 12
): Promise<SheltersResponse> {
  try {
    const params: Record<string, string> = { limit: limit.toString() };

    if (cursor) params.cursor = cursor;
    if (filters?.searchQuery) params.search = filters.searchQuery;
    if (filters?.sortBy) params.sortBy = filters.sortBy;
    if (filters?.latitude) params.lat = filters.latitude.toString();
    if (filters?.longitude) params.lng = filters.longitude.toString();
    if (filters?.country) params.country = filters.country;
    if (filters?.city) params.city = filters.city;

    const response = await http.get('/shelters', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching shelters:', error);
    throw error;
  }
}

export async function getShelterById(id: string): Promise<Shelter> {
  try {
    const response = await http.get(`/shelters/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching shelter ${id}:`, error);
    throw error;
  }
}

export async function getUserShelters(cursor?: string, limit: number = 12): Promise<SheltersResponse> {
  try {
    const params: Record<string, string> = { limit: limit.toString() };

    if (cursor) params.cursor = cursor;

    const response = await http.get('/user/me/shelters', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching user shelters:', error);
    throw error;
  }
}

export async function createShelter(data: CreateShelterData): Promise<Shelter> {
  try {
    const response = await http.post('/shelters', data);
    return response.data;
  } catch (error) {
    console.error('Error creating shelter:', error);
    throw error;
  }
}

export async function updateShelter(id: string, data: Partial<Shelter>): Promise<Shelter> {
  try {
    const response = await http.patch(`/shelters/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating shelter ${id}:`, error);
    throw error;
  }
}

export async function deleteShelter(id: string): Promise<void> {
  try {
    await http.delete(`/shelters/${id}`);
  } catch (error) {
    console.error(`Error deleting shelter ${id}:`, error);
    throw error;
  }
}

export async function uploadShelterAvatar(shelterId: string, file: File): Promise<Shelter> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await http.post(`/shelters/${shelterId}/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading shelter avatar:', error);
    throw error;
  }
}

export async function getShelterPets(shelterId: string, cursor?: string, limit: number = 12): Promise<PetsResponse> {
  try {
    const params: Record<string, string> = { limit: limit.toString() };

    if (cursor) params.cursor = cursor;

    const response = await http.get(`/shelters/${shelterId}/pets`, { params });
    return response.data;
  } catch (error) {
    console.error(`Error fetching pets for shelter ${shelterId}:`, error);
    throw error;
  }
}

export async function getShelterOwner(shelterId: string): Promise<User> {
  try {
    const response = await http.get(`/shelters/${shelterId}/owner`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching owner for shelter ${shelterId}:`, error);
    throw error;
  }
}
