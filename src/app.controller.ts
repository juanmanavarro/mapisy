import { Controller, Get, Param, Post, Query, Res, Headers } from '@nestjs/common';
import * as path from 'path';
import { Response } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MapDocument } from './schemas/map.schema';
import { Marker, MarkerDocument } from './schemas/marker.schema';
import { AppGateway } from './app.gateway';

@Controller()
export class AppController {
  constructor(
    @InjectModel(Map.name) private mapModel: Model<MapDocument>,
    @InjectModel(Marker.name) private markerModel: Model<MarkerDocument>,
    private appGateway: AppGateway,
  ) {}

  @Get()
  async getIndex(@Res() res: Response) {
    return res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
  }

  @Get(':id')
  async getMap(@Param('id') id: string, @Res() res: Response) {
    let map = await this.mapModel.findOne({ id });
    if (!map) {
      map = await this.mapModel.create({ id });
      map.isNew = true;
      await map.save();
    } else {
      map.isNew = false;
      await map.save();
    }

    return res.sendFile(path.join(__dirname, '..', 'public', 'map.html'));
  }

  @Post(':id')
  async postMarker(@Param('id') id: string, @Query() query: any, @Headers('authorization') auth: string, @Res() res: Response) {
    const map = await this.mapModel.findOne({ id });
    if (!map || !auth || !auth.startsWith('Bearer ') || auth.split(' ')[1] !== map.api_key) {
      return res.status(401).json({ message: 'Invalid API key'});
    }

    if (!query.latitude || !query.longitude) {
      return res.status(400).json({ message: 'Latitud y longitud son requeridos' });
    }

    const latitude = parseFloat(query.latitude);
    const longitude = parseFloat(query.longitude);

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({ message: 'Latitud y longitud deben ser números válidos' });
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({ message: 'Coordenadas fuera de rango' });
    }

    this.createMarker(id, query.latitude, query.longitude);
    return res.status(201).json({ message: 'Marker created' });
  }

  private createMarker(id: string, latitude: string, longitude: string) {
    this.appGateway.send('marker:created', {
      map_id: id,
      latitude,
      longitude,
    });

    return this.markerModel.create({ map_id: id, latitude, longitude });
  }

  @Get(':id/config')
  async configMap(@Param('id') id: string, @Res() res: Response) {
    let map = await this.mapModel.findOne({ id });
    if (!map) {
      return res.status(404).sendFile(path.join(__dirname, '..', 'public', '404.html'));
    }

      return res.sendFile(path.join(__dirname, '..', 'public', 'config.html'));
    }
}
