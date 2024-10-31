import { Controller, Get, Param, Post, Query, Res } from '@nestjs/common';
import * as path from 'path';
import { Response } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MapDocument } from './schemas/map.schema';
import { Marker, MarkerDocument } from './schemas/marker.schema';

@Controller()
export class AppController {
  constructor(
    @InjectModel(Map.name) private mapModel: Model<MapDocument>,
    @InjectModel(Marker.name) private markerModel: Model<MarkerDocument>
  ) {}

  @Get()
  async getIndex(@Res() res: Response) {
    return res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
  }

  @Get(':id')
  async getMap(@Param('id') id: string, @Res() res: Response, @Query() query: any) {
    let map = await this.mapModel.findOne({ id });
    if (!map) {
      map = await this.mapModel.create({ id });
    }

    if (query.latitude && query.longitude) {
      this.createMarker(id, query.latitude, query.longitude);
      return res.status(201).json({ message: 'Marker created' });
    }

    return res.sendFile(path.join(__dirname, '..', 'public', 'map.html'));
  }

  @Post(':id')
  async postMarker(@Param('id') id: string, @Query() query: any) {
    this.createMarker(id, query.latitude, query.longitude);
    return { message: 'Marker created' };
  }

  private createMarker(id: string, latitude: string, longitude: string) {
    return this.markerModel.create({ map_id: id, latitude, longitude });
  }
}
