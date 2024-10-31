export interface AddressDetails {
  house_number?: string;
  road?: string;
  suburb?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
  [key: string]: string | undefined;
}

export interface AddressValidationResult {
  isValid: boolean;
  formattedAddress?: string;
  latitude?: number;
  longitude?: number;
  addressDetails?: AddressDetails;
  place_id?: number;  // Añadido place_id
  error?: string;
  alternatives?: Array<{
    formattedAddress: string;
    latitude: number;
    longitude: number;
    addressDetails?: AddressDetails;
    place_id?: number;  // Añadido place_id para alternativas
  }>;
}
