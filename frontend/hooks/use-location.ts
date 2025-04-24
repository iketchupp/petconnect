import { useCallback, useEffect, useState } from 'react';

import { getLocationLabel } from '@/actions/locations';
import { getLocationErrorMessage } from '@/lib/utils';

interface UseLocationProps {
  initialSortBy?: string;
  initialLatitude?: number;
  initialLongitude?: number;
  onLocationChange?: (params: { sortBy: string; latitude?: number; longitude?: number }) => void;
}

export const useLocation = ({
  initialSortBy,
  initialLatitude,
  initialLongitude,
  onLocationChange,
}: UseLocationProps = {}) => {
  // Location state
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationLabel, setLocationLabel] = useState<string | null>(
    initialSortBy === 'distance' ? 'Loading location...' : null
  );
  const [sortBy, setSortBy] = useState<string | null>(initialSortBy || null);
  const [coordinates, setCoordinates] = useState<{
    latitude?: number;
    longitude?: number;
  }>({
    latitude: initialLatitude,
    longitude: initialLongitude,
  });

  // Function to handle location permission and get coordinates
  const handleLocationPermission = useCallback(async () => {
    setIsGettingLocation(true);
    setLocationError(null);
    setLocationLabel('Getting your location...');

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000,
        });
      });

      // Set coordinates and sort
      const newSortBy = 'distance';
      const newCoordinates = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };

      setSortBy(newSortBy);
      setCoordinates(newCoordinates);

      // Get and set location label
      const label = await getLocationLabel(position.coords.latitude, position.coords.longitude);
      setLocationLabel(label);

      // Callback to parent component
      if (onLocationChange) {
        onLocationChange({
          sortBy: newSortBy,
          ...newCoordinates,
        });
      }
    } catch (error) {
      console.error('Error getting location:', error);
      const geoError = error as GeolocationPositionError;
      setLocationError(getLocationErrorMessage(geoError));
      setLocationLabel(null);

      // Clear location data
      const newSortBy = null;
      const newCoordinates = {
        latitude: undefined,
        longitude: undefined,
      };

      setSortBy(newSortBy);
      setCoordinates(newCoordinates);

      // Callback to parent component
      if (onLocationChange) {
        onLocationChange({
          sortBy: newSortBy || '',
          ...newCoordinates,
        });
      }
    } finally {
      setIsGettingLocation(false);
    }
  }, [onLocationChange]);

  // Handle sort change with location permission check
  const handleSortChange = useCallback(
    async (value: string) => {
      if (value === 'distance') {
        await handleLocationPermission();
      } else {
        // Clear location data when switching to other sort options
        setLocationLabel(null);
        const newCoordinates = {
          latitude: undefined,
          longitude: undefined,
        };

        setCoordinates(newCoordinates);
        setSortBy(value === 'null' ? null : value);

        // Callback to parent component
        if (onLocationChange) {
          onLocationChange({
            sortBy: value === 'null' ? '' : value,
            ...newCoordinates,
          });
        }
      }
    },
    [handleLocationPermission, onLocationChange]
  );

  // Effect to handle initial distance sorting
  useEffect(() => {
    if (initialSortBy === 'distance' && initialLatitude && initialLongitude) {
      getLocationLabel(initialLatitude, initialLongitude).then(setLocationLabel);
    }
  }, [initialSortBy, initialLatitude, initialLongitude]);

  // Clear location data
  const clearLocation = useCallback(() => {
    setLocationError(null);
    setLocationLabel(null);
    setSortBy(null);
    setCoordinates({
      latitude: undefined,
      longitude: undefined,
    });
  }, []);

  const showLocationLabel = Boolean(sortBy === 'distance' && locationLabel);

  return {
    locationError,
    isGettingLocation,
    locationLabel,
    showLocationLabel,
    sortBy,
    coordinates,
    handleLocationPermission,
    handleSortChange,
    clearLocation,
    setLocationError,
    setLocationLabel,
  };
};
