import { Body, Controller, Get, Param, Post, Query, Res, Headers } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppGateway } from 'src/app.gateway';
import { MapDocument } from 'src/schemas/map.schema';
import { Marker, MarkerDocument } from 'src/schemas/marker.schema';
import { Response } from 'express';

@Controller('api/maps')
export class MarkerController {
  constructor(
    @InjectModel(Map.name) private mapModel: Model<MapDocument>,
    @InjectModel(Marker.name) private markerModel: Model<MarkerDocument>,
    private appGateway: AppGateway,
  ) {}

  // Comando curl para crear un marcador:
  // curl -X POST http://localhost:3009/api/maps/{id}/markers -H "Authorization: Bearer {API_KEY}" -H "Content-Type: application/json" -d '{"latitude": 0, "longitude": 0}'
  @Post(':id/markers')
  async createMarker(
    @Param('id') id: string,
    @Body() body: any,
    @Headers('authorization') auth: string,
    @Res() res: Response,
  ) {
    const map = await this.mapModel.findOne({ id });
    if (!map) {
      return res.status(404).json({ message: 'Map not found' });
    }

    if (!auth || !auth.startsWith('Bearer ') || auth.split(' ')[1] !== map.api_key) {
      return res.status(401).json({ message: 'Invalid API key'});
    }

    return await this.handleMarkerOperation(body, id, res);
  }

  // Comando curl para obtener marcadores:
  // curl -X GET http://localhost:3009/api/maps/{id}/markers?apiKey={API_KEY}
  @Get(':id/markers')
  async getMarker(
    @Param('id') id: string,
    @Query() query: any,
    @Res() res: Response,
  ) {
    const map = await this.mapModel.findOne({ id });
    if (!map) {
      return res.status(404).json({ message: 'Map not found' });
    }

    if (query.apiKey !== map.api_key) {
      return res.status(401).json({ message: 'Invalid API key'});
    }

    return await this.handleMarkerOperation(query, id, res);
  }

  private async handleMarkerOperation(data: any, id: string, res: Response) {
    const latitude = parseFloat(data.latitude);
    const longitude = parseFloat(data.longitude);

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({ message: 'Latitud y longitud deben ser números válidos' });
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({ message: 'Coordenadas fuera de rango' });
    }

    const marker = await this.markerModel.create({ map_id: id, latitude, longitude });

    this.appGateway.send('marker:created', {
      map_id: id,
      latitude,
      longitude,
    });

    return res.status(201).json({ message: 'Marker created', marker });
  }
}
