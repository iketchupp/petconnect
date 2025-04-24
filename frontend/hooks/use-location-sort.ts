import { useState } from 'react';

import { getLocationLabel } from '@/actions/locations';
import { getLocationErrorMessage, getUserLocation } from '@/lib/utils';

interface UseLocationSortProps {
  onLocationSuccess: (position: GeolocationPosition) => void;
  onLocationError: () => void;
}

export function useLocationSort({ onLocationSuccess, onLocationError }: UseLocationSortProps) {
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationLabel, setLocationLabel] = useState<string | null>(null);

  const handleLocationSort = async () => {
    setIsGettingLocation(true);
    setLocationError(null);
    setLocationLabel('Getting your location...');

    try {
      const position = await getUserLocation();

      // Get and set location label
      const label = await getLocationLabel(position.coords.latitude, position.coords.longitude);
      setLocationLabel(label);

      onLocationSuccess(position);
    } catch (error) {
      console.error('Error getting location:', error);
      const geoError = error as GeolocationPositionError;
      setLocationError(getLocationErrorMessage(geoError));
      setLocationLabel(null);
      onLocationError();
    } finally {
      setIsGettingLocation(false);
    }
  };

  const clearLocationData = () => {
    setLocationLabel(null);
    setLocationError(null);
  };

  return {
    isGettingLocation,
    locationError,
    locationLabel,
    handleLocationSort,
    clearLocationData,
  };
}
