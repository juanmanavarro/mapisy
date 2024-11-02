import { Controller, Get, Param, Post, Query, Res, Headers, Body } from '@nestjs/common';
import * as path from 'path';
import { query, Response } from 'express';
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
    }
    else {
      map.isNew = false;
      await map.save();
    }

    return res.sendFile(path.join(__dirname, '..', 'public', 'map.html'));
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
