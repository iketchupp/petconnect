import { useCallback, useEffect, useRef, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';

import { GoogleMapsTypes } from '@/types/google-maps';
import { cn } from '@/lib/utils';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { ShelterFormValues } from './types';

interface ShelterAddressProps {
  form: UseFormReturn<ShelterFormValues>;
}

// Helper to prevent multiple script loads
const loadGoogleMapsScript = (() => {
  let scriptPromise: Promise<void> | null = null;

  return (apiKey: string) => {
    if (!scriptPromise) {
      scriptPromise = new Promise((resolve, reject) => {
        // Check if the script is already loaded
        if (window.google && window.google.maps) {
          resolve();
          return;
        }

        // Check if script is already in the DOM
        const existingScript = document.getElementById('google-maps-script') as HTMLScriptElement;
        if (existingScript) {
          // If it's there but loading is not complete, wait for it
          existingScript.addEventListener('load', () => resolve());
          existingScript.addEventListener('error', () => reject(new Error('Google Maps script load error')));
          return;
        }

        // Create script element
        const script = document.createElement('script');
        script.id = 'google-maps-script';
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;

        script.addEventListener('load', () => resolve());
        script.addEventListener('error', () => {
          scriptPromise = null; // Reset so we can try again
          reject(new Error('Google Maps script load error'));
        });

        document.head.appendChild(script);
      });
    }

    return scriptPromise;
  };
})();

// Helper function to get address component
const getAddressComponent = (
  components: GoogleMapsTypes.places.AddressComponent[] | undefined,
  type: string,
  useShortName = false
): string => {
  if (!components) return '';

  const component = components.find((component) => component.types.includes(type));
  return component ? (useShortName ? component.short_name : component.long_name) : '';
};

// Add custom styles to match shadcn theme
const addShadcnStyles = () => {
  const styleElement = document.getElementById('places-shadcn-styles') || document.createElement('style');
  styleElement.id = 'places-shadcn-styles';
  styleElement.textContent = `
    /* Custom styles for Google Places Autocomplete to match project theme */
    body .pac-container {
      background: oklch(1 0 0) !important; /* --background in light mode */
      color: oklch(0.141 0.005 285.823) !important; /* --foreground in light mode */
      border-radius: var(--radius) !important;
      border: 1px solid oklch(0.92 0.004 286.32) !important; /* --border */
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
      font-family: var(--font-sans) !important;
      margin-top: 4px !important;
      padding: 0.5rem !important;
      z-index: 9999 !important;
      opacity: 1 !important;
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
      box-sizing: border-box !important;
    }

    body .pac-item,
    body .pac-item.pac-item-selected {
      border-top: 1px solid oklch(0.92 0.004 286.32) !important; /* --border */
      padding: 0.5rem !important;
      cursor: pointer !important;
      display: flex !important;
      align-items: center !important;
      color: oklch(0.141 0.005 285.823) !important; /* --foreground */
      background: oklch(1 0 0) !important; /* --background */
      background-image: none !important;
      opacity: 1 !important;
      box-sizing: border-box !important;
    }

    body .pac-item:first-child {
      border-top: none !important;
    }

    body .pac-item:hover,
    body .pac-item.pac-item-selected,
    body .pac-item-selected {
      background: oklch(0.967 0.001 286.375) !important; /* --accent */
      color: oklch(0.21 0.006 285.885) !important; /* --accent-foreground */
    }

    body .pac-icon {
      display: none !important;
    }

    body .pac-item-query {
      font-size: 0.875rem !important;
      color: oklch(0.141 0.005 285.823) !important; /* --foreground */
      font-weight: 500 !important;
      margin-right: 0.5rem !important;
    }

    body .pac-matched {
      color: oklch(0.21 0.006 285.885) !important; /* --primary */
      font-weight: 600 !important;
    }

    body .pac-item > span:not(.pac-item-query) {
      font-size: 0.75rem !important;
      color: oklch(0.552 0.016 285.938) !important; /* --muted-foreground */
    }

    /* Dark mode support - ensure it works with different implementations */
    .dark body .pac-container,
    body.dark .pac-container,
    [data-theme="dark"] .pac-container,
    html.dark .pac-container {
      background: oklch(0.141 0.005 285.823) !important; /* --background in dark mode */
      color: oklch(0.985 0 0) !important; /* --foreground in dark mode */
      border-color: oklch(0.274 0.006 286.033) !important; /* --border in dark mode */
    }

    .dark body .pac-item,
    body.dark .pac-item,
    [data-theme="dark"] .pac-item,
    html.dark .pac-item {
      border-color: oklch(0.274 0.006 286.033) !important; /* --border in dark mode */
      color: oklch(0.985 0 0) !important; /* --foreground in dark mode */
      background: oklch(0.141 0.005 285.823) !important; /* --background in dark mode */
    }

    .dark body .pac-item:hover,
    body.dark .pac-item:hover,
    [data-theme="dark"] .pac-item:hover,
    html.dark .pac-item:hover,
    .dark body .pac-item.pac-item-selected,
    body.dark .pac-item.pac-item-selected,
    [data-theme="dark"] .pac-item.pac-item-selected,
    html.dark .pac-item.pac-item-selected {
      background: oklch(0.274 0.006 286.033) !important; /* --accent in dark mode */
      color: oklch(0.985 0 0) !important; /* --accent-foreground in dark mode */
    }

    .dark body .pac-item-query,
    body.dark .pac-item-query,
    [data-theme="dark"] .pac-item-query,
    html.dark .pac-item-query {
      color: oklch(0.985 0 0) !important; /* --foreground in dark mode */
    }

    .dark body .pac-matched,
    body.dark .pac-matched,
    [data-theme="dark"] .pac-matched,
    html.dark .pac-matched {
      color: oklch(0.985 0 0) !important; /* --primary in dark mode */
    }

    .dark body .pac-item > span:not(.pac-item-query),
    body.dark .pac-item > span:not(.pac-item-query),
    [data-theme="dark"] .pac-item > span:not(.pac-item-query),
    html.dark .pac-item > span:not(.pac-item-query) {
      color: oklch(0.705 0.015 286.067) !important; /* --muted-foreground in dark mode */
    }
  `;

  if (!styleElement.parentNode) {
    document.head.appendChild(styleElement);
  }
};

export function ShelterAddress({ form }: ShelterAddressProps) {
  const [activeTab, setActiveTab] = useState<string>('search');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const autocompleteInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<GoogleMapsTypes.places.Autocomplete | null>(null);
  const listenerRef = useRef<GoogleMapsTypes.MapsEventListener | null>(null);

  // Handle Google Maps API authorization failure
  useEffect(() => {
    // Set up global error handler for Google Maps API authorization errors
    window.gm_authFailure = () => {
      console.error('Google Maps API authorization failure');
      setLoadError(
        'Google Maps API authorization failure. Please ensure the Places API is enabled in your Google Cloud Console.'
      );
      setIsLoaded(false);
      setIsLoading(false);
    };

    return () => {
      // Clean up the global handler when component unmounts
      window.gm_authFailure = undefined;
    };
  }, []);

  // Load Google Maps API script
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      setLoadError('Google Maps API key is missing in your environment variables');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    loadGoogleMapsScript(apiKey)
      .then(() => {
        if (!window.google || !window.google.maps || !window.google.maps.places) {
          throw new Error('Places API not loaded properly');
        }
        setIsLoaded(true);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Failed to load Google Maps API:', error);
        setLoadError(error.message || 'Failed to load Google Maps API');
        setIsLoading(false);
      });
  }, []);

  // Add custom styles for the Places autocomplete
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      addShadcnStyles();
    }
  }, [isLoaded]);

  // Clean up function for autocomplete
  const cleanupAutocomplete = useCallback(() => {
    if (autocompleteRef.current) {
      window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      autocompleteRef.current = null;
    }
    if (listenerRef.current) {
      listenerRef.current.remove();
      listenerRef.current = null;
    }
  }, []);

  // Initialize autocomplete
  const initAutocomplete = useCallback(() => {
    if (!isLoaded || !autocompleteInputRef.current) return;

    // Clean up any existing autocomplete instance first
    cleanupAutocomplete();

    try {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(autocompleteInputRef.current, {
        types: ['address'],
        fields: ['address_components', 'formatted_address', 'geometry'],
      });

      // Add a listener for when a place is selected
      listenerRef.current = autocompleteRef.current.addListener('place_changed', () => {
        if (!autocompleteRef.current) return;

        const place = autocompleteRef.current.getPlace();
        if (!place.geometry) return;

        handlePlaceSelect(place);
      });
    } catch (error) {
      console.error('Error initializing autocomplete:', error);
      setLoadError('Error initializing address search. Please check that Places API is enabled.');
    }
  }, [isLoaded, cleanupAutocomplete]);

  // Initialize autocomplete when the API is loaded
  useEffect(() => {
    if (isLoaded) {
      initAutocomplete();
    }

    return () => {
      cleanupAutocomplete();
    };
  }, [isLoaded, initAutocomplete, cleanupAutocomplete]);

  // Re-initialize autocomplete when switching to search tab
  useEffect(() => {
    if (activeTab === 'search' && isLoaded) {
      // Small delay to ensure input is ready
      const timer = setTimeout(() => {
        initAutocomplete();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [activeTab, isLoaded, initAutocomplete]);

  const handlePlaceSelect = useCallback(
    (place: GoogleMapsTypes.places.PlaceResult) => {
      if (!place.address_components) return;

      const streetNumber = getAddressComponent(place.address_components, 'street_number');
      const route = getAddressComponent(place.address_components, 'route');
      const address1 = streetNumber ? `${streetNumber} ${route}` : route;

      const city =
        getAddressComponent(place.address_components, 'locality') ||
        getAddressComponent(place.address_components, 'sublocality') ||
        getAddressComponent(place.address_components, 'administrative_area_level_3');

      const region = getAddressComponent(place.address_components, 'administrative_area_level_1', true);
      const postalCode = getAddressComponent(place.address_components, 'postal_code');
      const country = getAddressComponent(place.address_components, 'country');

      form.setValue('address.address1', address1);
      form.setValue('address.city', city);
      form.setValue('address.region', region);
      form.setValue('address.postalCode', postalCode);
      form.setValue('address.country', country);

      if (place.geometry && place.geometry.location) {
        form.setValue('address.lat', place.geometry.location.lat());
        form.setValue('address.lng', place.geometry.location.lng());
      }

      // Switch to manual tab to see and edit the filled fields
      setActiveTab('manual');
    },
    [form]
  );

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Address Information</h2>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="search">Search Address</TabsTrigger>
          <TabsTrigger value="manual">Enter Manually</TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-4">
          {loadError && (
            <div className="flex rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-600">
              <AlertCircle className="mr-2 h-5 w-5 flex-shrink-0" />
              <div>
                <p className="font-medium">API Error</p>
                <p>{loadError}</p>
                <p className="mt-1">Please use manual entry instead or check the README for setup instructions.</p>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Input
              ref={autocompleteInputRef}
              placeholder="Type to search for an address..."
              className={cn(
                'focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2',
                isFocused && 'ring-ring ring-2 ring-offset-2'
              )}
              disabled={!isLoaded || isLoading}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={(e) => {
                // Prevent form submission when Enter is pressed in the autocomplete field
                if (e.key === 'Enter') {
                  e.preventDefault();
                }
              }}
            />
          </div>

          {isLoading && <p className="text-muted-foreground text-sm">Loading Google Places API...</p>}

          <FormDescription>
            Start typing your address and select from the dropdown suggestions. Google Places will help autocomplete
            your address.
            {!isLoaded && !isLoading && !loadError && (
              <span className="mt-2 block text-amber-600">
                Note: To use this feature, you need to enable the Places API in your Google Cloud Console.
              </span>
            )}
          </FormDescription>
        </TabsContent>

        <TabsContent value="manual" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="address.address1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address Line 1</FormLabel>
                  <FormControl>
                    <Input placeholder="123 Main St" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address.address2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address Line 2 (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Apt 4B, Suite 100, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="address.city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder="San Francisco" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address.region"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State/Province/Region</FormLabel>
                  <FormControl>
                    <Input placeholder="CA" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="address.postalCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Postal Code</FormLabel>
                  <FormControl>
                    <Input placeholder="94105" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address.country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Input placeholder="United States" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
