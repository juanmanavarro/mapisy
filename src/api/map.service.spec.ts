import { Test, TestingModule } from '@nestjs/testing';
import { MapService } from './map.service';
import { getModelToken } from '@nestjs/mongoose';
import { Map } from 'src/schemas/map.schema';
import { Marker } from 'src/schemas/marker.schema';
import { Logger } from '@nestjs/common';

// Mock Mongoose Model
const mockMapModel = {
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  deleteOne: jest.fn(),
  updateOne: jest.fn(),
  countDocuments: jest.fn(),
  // exec: jest.fn().mockResolvedValue(null), // Default exec mock
};

const mockMarkerModel = {
  countDocuments: jest.fn(),
  deleteMany: jest.fn(),
  create: jest.fn(),
};

// Mock exec for chained calls
mockMapModel.find.mockReturnValue({ exec: jest.fn() });
mockMapModel.findOne.mockReturnValue({ exec: jest.fn() });
mockMapModel.deleteOne.mockReturnValue({ exec: jest.fn() });
// mockMarkerModel.countDocuments.mockReturnValue({ exec: jest.fn() }); // Not always chained

describe('MapService', () => {
  let service: MapService;

  beforeEach(async () => {
    // Reset mocks for each test
    mockMapModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue([]) });
    mockMapModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
    mockMapModel.deleteOne.mockReturnValue({ exec: jest.fn().mockResolvedValue({ acknowledged: true, deletedCount: 1 }) });
    mockMarkerModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValue(0) });


    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MapService,
        {
          provide: getModelToken(Map.name),
          useValue: mockMapModel,
        },
        {
          provide: getModelToken(Marker.name),
          useValue: mockMarkerModel,
        },
        // Logger can often be omitted or mocked if its calls are critical to test
      ],
    }).compile();

    service = module.get<MapService>(MapService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('deleteOldMapsWithoutMarkers', () => {
    it('should log and do nothing if no old maps are found', async () => {
      mockMapModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue([]) });
      const loggerSpy = jest.spyOn(Logger.prototype, 'log');
      await service.deleteOldMapsWithoutMarkers();
      expect(loggerSpy).toHaveBeenCalledWith(expect.stringContaining('No maps older than one month found'));
      loggerSpy.mockRestore();
    });

    // Add more tests here:
    // - should delete an old map with no markers
    // - should not delete an old map with markers
    // - should not delete a recent map
    // - should not delete the 'demo' map
  });
  
  describe('createMap', () => {
    // Add tests for createMap
    // - should create a map successfully
    // - should throw ConflictException if ID is missing
    // - should throw ConflictException if map ID already exists
  });

  describe('updateMap', () => {
    // Add tests for updateMap
    // - should update a map successfully
    // - should throw NotFoundException if map not found
    // - should throw UnauthorizedException if API key is invalid
  });
  
  // Add tests for seedTestDataForDeletionLogic if desired, though it's a test helper
});
