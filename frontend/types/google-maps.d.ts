// Define Google Maps types
export namespace GoogleMapsTypes {
  export interface MapsEventListener {
    remove: () => void;
  }

  export namespace places {
    export interface AddressComponent {
      long_name: string;
      short_name: string;
      types: string[];
    }

    export interface PlaceResult {
      place_id?: string;
      formatted_address?: string;
      address_components?: AddressComponent[];
      geometry?: {
        location: {
          lat: () => number;
          lng: () => number;
        };
      };
    }

    export interface AutocompleteOptions {
      types?: string[];
      fields?: string[];
    }

    export interface Autocomplete {
      addListener: (event: string, callback: () => void) => GoogleMapsTypes.MapsEventListener;
      getPlace: () => PlaceResult;
    }
  }
}

// Add Google Maps type declarations to Window
declare global {
  interface Window {
    google: {
      maps: {
        places: {
          Autocomplete: new (
            input: HTMLInputElement,
            options?: GoogleMapsTypes.places.AutocompleteOptions
          ) => GoogleMapsTypes.places.Autocomplete;
        };
        event: {
          clearInstanceListeners: (instance: any) => void;
        };
      };
    };
    gm_authFailure?: () => void;
  }
}
