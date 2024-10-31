// address.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import axios from 'axios';
import { AddressService } from './address.service';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('AddressService', () => {
  let service: AddressService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AddressService],
    }).compile();

    service = module.get<AddressService>(AddressService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return valid address when found', async () => {
    const mockResponse = {
      data: [
        {
          display_name: 'Calle Principal 123, Ciudad Ejemplo, País',
          lat: '40.7128',
          lon: '-74.0060'
        }
      ]
    };
    mockedAxios.get.mockResolvedValue(mockResponse);

    const result = await AddressService.validate('Calle Principal 123');
    expect(result.isValid).toBe(true);
    expect(result.formattedAddress).toBe('Calle Principal 123, Ciudad Ejemplo, País');
    expect(result.latitude).toBe(40.7128);
    expect(result.longitude).toBe(-74.0060);
  });

  it('should return invalid address when not found', async () => {
    const mockResponse = { data: [] };
    mockedAxios.get.mockResolvedValue(mockResponse);

    const result = await AddressService.validate('Dirección Inexistente');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Dirección no encontrada');
  });

  it('should handle errors', async () => {
    mockedAxios.get.mockRejectedValue(new Error('Network error'));

    const result = await AddressService.validate('Calle Principal 123');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Error en la solicitud');
  });

  it('should return alternatives when multiple results are found', async () => {
    const mockResponse = {
      data: [
        {
          display_name: 'Calle Principal 123, Ciudad A, País',
          lat: '40.7128',
          lon: '-74.0060'
        },
        {
          display_name: 'Calle Principal 123, Ciudad B, País',
          lat: '41.8781',
          lon: '-87.6298'
        }
      ]
    };
    mockedAxios.get.mockResolvedValue(mockResponse);

    const result = await AddressService.validate('Calle Principal 123');
    expect(result.isValid).toBe(true);
    expect(result.alternatives).toBeDefined();
    expect(result.alternatives?.length).toBe(1);
    expect(result.alternatives?.[0].formattedAddress).toBe('Calle Principal 123, Ciudad B, País');
  });
});
