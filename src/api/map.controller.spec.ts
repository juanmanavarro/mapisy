import { Test, TestingModule } from '@nestjs/testing';
import { MapController } from './map.controller';
import { MapService } from './map.service';
import { AppGateway } from 'src/app.gateway';
// Assuming DTOs are exported or defined here - if not, they need to be defined or imported
// For this stub, we'll assume they are available or we'll define them inline if needed.
// If CreateMapDto and UpdateMapDto are inline in map.controller.ts and not exported,
// you might need to define simplified versions here for the tests.
// For example:
class CreateMapDto {
  id: string;
  email?: string;
  title?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  zoom?: number;
}

class UpdateMapDto {
  latitude?: number;
  longitude?: number;
  zoom?: number;
  title?: string;
  description?: string;
}


import { HttpStatus, ConflictException, NotFoundException, UnauthorizedException, HttpException } from '@nestjs/common';

// Mock MapService
const mockMapService = {
  createMap: jest.fn(),
  updateMap: jest.fn(),
  // deleteOldMapsWithoutMarkers is not directly called by controller
};

// Mock AppGateway
const mockAppGateway = {
  send: jest.fn(),
};

// Mock Response object for Express
const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};


describe('MapController', () => {
  let controller: MapController;
  let service: MapService;

  beforeEach(async () => {
    // Reset mocks for each test
    mockMapService.createMap.mockReset();
    mockMapService.updateMap.mockReset();
    mockAppGateway.send.mockReset();


    const module: TestingModule = await Test.createTestingModule({
      controllers: [MapController],
      providers: [
        {
          provide: MapService,
          useValue: mockMapService,
        },
        {
          provide: AppGateway,
          useValue: mockAppGateway,
        },
      ],
    }).compile();

    controller = module.get<MapController>(MapController);
    service = module.get<MapService>(MapService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a map and return 201 status', async () => {
      const createMapDto: CreateMapDto = { id: 'test-map', title: 'Test Map' };
      const newMap = { ...createMapDto, api_key: 'testkey', createdAt: new Date(), updatedAt: new Date() };
      mockMapService.createMap.mockResolvedValue(newMap);
      const res = mockResponse();

      await controller.create(createMapDto, res);

      expect(mockMapService.createMap).toHaveBeenCalledWith(createMapDto);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(res.json).toHaveBeenCalledWith(newMap);
    });
    
    it('should return 400 if ID is not provided in DTO', async () => {
      const createMapDto: any = { title: 'Test Map Without ID' }; // Missing id
      const res = mockResponse();
      await controller.create(createMapDto, res);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({ message: 'Map ID must be provided.' });
    });

    it('should handle ConflictException from service and return 409 status', async () => {
      const createMapDto: CreateMapDto = { id: 'test-map', title: 'Test Map' };
      mockMapService.createMap.mockRejectedValue(new ConflictException('Map already exists'));
      const res = mockResponse();

      await controller.create(createMapDto, res);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
      expect(res.json).toHaveBeenCalledWith({ message: 'Map already exists' });
    });

    it('should handle generic HttpException from service', async () => {
        const createMapDto: CreateMapDto = { id: 'test-map' };
        mockMapService.createMap.mockRejectedValue(new HttpException('Some Error', HttpStatus.INTERNAL_SERVER_ERROR));
        const res = mockResponse();
  
        await controller.create(createMapDto, res);
        expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(res.json).toHaveBeenCalledWith({ message: 'Some Error' });
      });
  
      it('should handle non-HttpException from service and return 500 status', async () => {
        const createMapDto: CreateMapDto = { id: 'test-map' };
        mockMapService.createMap.mockRejectedValue(new Error('Generic error'));
        const res = mockResponse();
  
        await controller.create(createMapDto, res);
        expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(res.json).toHaveBeenCalledWith({ message: 'Error creating map', error: 'Generic error' });
      });
  });

  describe('config (update)', () => {
    it('should update a map and return 200 status', async () => {
      const updateMapDto: UpdateMapDto = { title: 'Updated Title' };
      const mapId = 'test-map';
      const apiKey = 'test-api-key';
      const updatedMap = { id: mapId, title: 'Updated Title', api_key: apiKey };
      mockMapService.updateMap.mockResolvedValue(updatedMap);
      const res = mockResponse();

      await controller.config(mapId, updateMapDto, `Bearer ${apiKey}`, res);

      expect(mockMapService.updateMap).toHaveBeenCalledWith(mapId, updateMapDto, apiKey);
      expect(mockAppGateway.send).toHaveBeenCalledWith('map:updated', { map: updatedMap });
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({ message: 'Map updated', map: updatedMap });
    });

    it('should return 401 if auth header is missing', async () => {
      const updateMapDto: UpdateMapDto = { title: 'Updated Title' };
      const res = mockResponse();
      await controller.config('test-id', updateMapDto, undefined, res); // No auth header
      expect(res.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
      expect(res.json).toHaveBeenCalledWith({ message: 'Authorization header missing or malformed' });
    });

    it('should return 401 if auth header is malformed', async () => {
        const updateMapDto: UpdateMapDto = { title: 'Updated Title' };
        const res = mockResponse();
        await controller.config('test-id', updateMapDto, 'InvalidAuth', res); // Malformed auth header
        expect(res.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
        expect(res.json).toHaveBeenCalledWith({ message: 'Authorization header missing or malformed' });
      });

    it('should return 400 if no updatable fields are provided', async () => {
      const updateMapDto: UpdateMapDto = {}; // No fields
      const res = mockResponse();
      await controller.config('test-id', updateMapDto, 'Bearer test-key', res);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({ message: 'Any of these fields are required: latitude, longitude, zoom, title, description' });
    });

    it('should handle NotFoundException from service', async () => {
      const updateMapDto: UpdateMapDto = { title: 'Updated Title' };
      mockMapService.updateMap.mockRejectedValue(new NotFoundException('Map not found'));
      const res = mockResponse();
      await controller.config('test-id', updateMapDto, 'Bearer test-key', res);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({ message: 'Map not found' });
    });

    it('should handle UnauthorizedException from service', async () => {
      const updateMapDto: UpdateMapDto = { title: 'Updated Title' };
      mockMapService.updateMap.mockRejectedValue(new UnauthorizedException('Invalid API key'));
      const res = mockResponse();
      await controller.config('test-id', updateMapDto, 'Bearer test-key', res);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid API key' });
    });

    it('should handle generic HttpException from service during update', async () => {
        const updateMapDto: UpdateMapDto = { title: 'Updated Title' };
        mockMapService.updateMap.mockRejectedValue(new HttpException('Some Update Error', HttpStatus.INTERNAL_SERVER_ERROR));
        const res = mockResponse();
        await controller.config('test-id', updateMapDto, 'Bearer test-key', res);
        expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(res.json).toHaveBeenCalledWith({ message: 'Some Update Error' });
      });
  
      it('should handle non-HttpException from service and return 500 status during update', async () => {
        const updateMapDto: UpdateMapDto = { title: 'Updated Title' };
        mockMapService.updateMap.mockRejectedValue(new Error('Generic update error'));
        const res = mockResponse();
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {}); // Suppress console.error for this test
  
        await controller.config('test-id', updateMapDto, 'Bearer test-key', res);
        expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(res.json).toHaveBeenCalledWith({ message: 'Error updating map', error: 'Generic update error' });
        consoleErrorSpy.mockRestore();
      });
  });
});
