import { Body, Controller, Get, Param, Post, Res, Headers } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MapDocument } from './schemas/map.schema';
import { Response } from 'express';
import { AppGateway } from './app.gateway';
import { Marker, MarkerDocument } from './schemas/marker.schema';

@Controller('api')
export class ApiController {
  constructor(
    @InjectModel(Map.name) private mapModel: Model<MapDocument>,
    @InjectModel(Marker.name) private markerModel: Model<MarkerDocument>,
    private appGateway: AppGateway,
  ) {}

  @Get('maps/:id')
  async getMap(@Param('id') id: string, @Res() res: Response) {
    const map = await this.mapModel.findOne({ id }).populate('markers');

    if (!map.isNew) {
      map.api_key = undefined;
    }

    return res.json(map);
  }

  @Post('maps/:id/markers')
  async createMarker(@Param('id') id: string, @Body() body: any, @Headers('authorization') auth: string, @Res() res: Response) {
    const map = await this.mapModel.findOne({ id });
    if (!map) {
      return res.status(404).json({ message: 'Map not found' });
    }

    if (!auth || !auth.startsWith('Bearer ') || auth.split(' ')[1] !== map.api_key) {
      return res.status(401).json({ message: 'Invalid API key'});
    }

    const latitude = parseFloat(body.latitude);
    const longitude = parseFloat(body.longitude);

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({ message: 'Latitud y longitud deben ser números válidos' });
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({ message: 'Coordenadas fuera de rango' });
    }

    await this.markerModel.create({ map_id: id, latitude, longitude });

    this.appGateway.send('marker:created', {
      map_id: id,
      latitude,
      longitude,
    });

    return res.status(201).json({ message: 'Marker created' });
  }

  @Post('maps/:id/config')
  async config(@Param('id') id: string, @Body() body: any) {
    if (!body.latitude || !body.longitude || !body.zoom || !body.email) {
      throw new Error('Latitud, longitud, zoom y email son requeridos');
    }

    await this.mapModel.updateOne({ id }, { $set: body });
  }
}
