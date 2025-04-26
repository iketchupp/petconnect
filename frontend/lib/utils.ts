import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { User } from '@/types/api';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getAbbreviation(string: string) {
  return string.substring(0, 2).toUpperCase();
}

export function getFullName(user: User) {
  return `${user.firstName} ${user.lastName}`;
}

export function getInitials(user: User) {
  return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
}

export function getWebsiteUrl(url: string) {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `https://${url}`;
}

export function stripProtocol(url: string) {
  return url.replace(/^https?:\/\//, '');
}

// Helper function to capitalize first letter of each word
export const capitalizeWords = (str: string) => {
  return str
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Function to get error message based on GeolocationPositionError code
export const getLocationErrorMessage = (error: GeolocationPositionError) => {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return 'Location permission was denied. Please enable location access in your browser settings to use this feature.';
    case error.POSITION_UNAVAILABLE:
      return "Unable to determine your location. Please check your device's location settings or try again.";
    case error.TIMEOUT:
      return 'Location request timed out. Please try again.';
    default:
      return 'An error occurred while getting your location. Please try again.';
  }
};

// Helper function to get user's location
export const getUserLocation = async (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 30000,
    });
  });
};
