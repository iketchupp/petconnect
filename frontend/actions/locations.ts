import axios from 'axios';

import { http } from '@/lib/http';

export async function getCountries(): Promise<string[]> {
  try {
    const response = await http.get('/locations/countries');
    return response.data;
  } catch (error) {
    console.error('Error fetching countries:', error);
    throw error;
  }
}

export async function getCities(country: string): Promise<string[]> {
  try {
    const response = await http.get('/locations/cities', {
      params: { country },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching cities:', error);
    throw error;
  }
}

export async function getLocationLabel(latitude: number, longitude: number): Promise<string> {
  try {
    const { data } = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: {
        lat: latitude,
        lon: longitude,
        format: 'json',
      },
    });

    if (data.address) {
      const city = data.address.city || data.address.town || data.address.village || data.address.suburb;
      const country = data.address.country;
      return city && country ? `${city}, ${country}` : country || city || 'Unknown location';
    }
    return 'Location found';
  } catch (error) {
    console.error('Error getting location details:', error);
    return 'Location found';
  }
}
