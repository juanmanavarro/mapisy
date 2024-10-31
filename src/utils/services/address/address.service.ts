import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosError } from 'axios';
import { AddressValidationResult, AddressDetails } from './address.interface';

@Injectable()
export class AddressService {
  static async validate(address: string): Promise<AddressValidationResult> {
    const url = `https://nominatim.openstreetmap.org/search?addressdetails=1&format=json&q=${encodeURIComponent(address)}&limit=5`;

    try {
      const response = await axios.get(url, {
        timeout: 5000
      });
      const data = response.data;

      const validResults = data.filter(result =>
        result.address && result.address.postcode && result.address.road
      );

      if (validResults.length > 0) {
        const mainResult = validResults[0];
        const alternatives = validResults.slice(1).map(result => ({
          formattedAddress: result.display_name,
          latitude: parseFloat(result.lat),
          longitude: parseFloat(result.lon),
          addressDetails: result.address as AddressDetails,
          place_id: result.place_id
        }));

        return {
          isValid: true,
          formattedAddress: mainResult.display_name,
          latitude: parseFloat(mainResult.lat),
          longitude: parseFloat(mainResult.lon),
          addressDetails: mainResult.address as AddressDetails,
          place_id: mainResult.place_id,
          alternatives: alternatives.length > 0 ? alternatives : undefined
        };
      } else {
        return {
          isValid: false,
          error: 'Dirección no encontrada o sin código postal o calle',
          alternatives: []
        };
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        if (axiosError.code === 'ECONNABORTED') {
          return {
            isValid: false,
            error: 'La solicitud ha excedido el tiempo de espera',
            alternatives: []
          };
        } else if (axiosError.response) {
          return {
            isValid: false,
            error: `Error del servidor: ${axiosError.response.status}`,
            alternatives: []
          };
        } else if (axiosError.request) {
          return {
            isValid: false,
            error: 'No se recibió respuesta del servidor',
            alternatives: []
          };
        }
      }

      return {
        isValid: false,
        error: 'Error en la solicitud',
        alternatives: []
      };
    }
  }

  static mapAddress(addressDetails: any) {
    return {
      street: addressDetails.road,
      city: addressDetails.city || addressDetails.town || addressDetails.village,
      province: addressDetails.state,
      zipcode: addressDetails.postcode,
    };
  }
}
