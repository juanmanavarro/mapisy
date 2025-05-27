import { Body, Controller, Get, Param, Post, Put, Res, Headers, HttpStatus, HttpException, UseGuards } from '@nestjs/common'; // Added HttpStatus, HttpException
import { Response } from 'express';
import { AppGateway } from 'src/app.gateway';
import { MapService } from './map.service'; // Import MapService
import { MapDocument, Map } from 'src/schemas/map.schema'; // Import Map

// Define a simple DTO for map creation (can be expanded or moved to a separate file)
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

@Controller('api/maps')
export class MapController {
  constructor(
    private readonly mapService: MapService, // Inject MapService
    private appGateway: AppGateway,
  ) {}

  @Post()
  async create(@Body() createMapDto: CreateMapDto, @Res() res: Response) {
    try {
      // Ensure ID is provided, as it's crucial for our setup
      if (!createMapDto.id) {
         return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Map ID must be provided.' });
      }
      const map = await this.mapService.createMap(createMapDto);
      return res.status(HttpStatus.CREATED).json(map);
    } catch (error) {
      if (error instanceof HttpException) {
        return res.status(error.getStatus()).json({ message: error.message });
      }
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Error creating map', error: error.message });
    }
  }

  @Put(':id')
  async config(@Param('id') id: string, @Body() updateMapDto: UpdateMapDto, @Headers('authorization') auth: string, @Res() res: Response) {
    try {
      if (!auth || !auth.startsWith('Bearer ')) {
        return res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Authorization header missing or malformed' });
      }
      const apiKey = auth.split(' ')[1];

      const fieldsToUpdate = ['latitude', 'longitude', 'zoom', 'title', 'description'];
      if (!fieldsToUpdate.some(field => updateMapDto[field] !== undefined)) {
        return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Any of these fields are required: latitude, longitude, zoom, title, description' });
      }
      
      const updatedMap = await this.mapService.updateMap(id, updateMapDto, apiKey);
      this.appGateway.send('map:updated', { map: updatedMap }); // Consider moving this to the service or using an event emitter
      return res.status(HttpStatus.OK).json({ message: 'Map updated', map: updatedMap });
    } catch (error) {
      if (error instanceof HttpException) {
        return res.status(error.getStatus()).json({ message: error.message });
      }
      // Log non-HttpException errors for debugging
      console.error('Error updating map:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Error updating map', error: error.message });
    }
  }
}
