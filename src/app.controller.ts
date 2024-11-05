import { Controller, Get, Param, Render, Res } from '@nestjs/common';
import * as path from 'path';
import { Response } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MapDocument } from './schemas/map.schema';

@Controller()
export class AppController {
  constructor(
    @InjectModel(Map.name) private mapModel: Model<MapDocument>,
  ) {}

  @Get()
  @Render('index')
  async getIndex(@Res() res: Response) {
    return { title: 'Instam.app' };
  }

  @Get(':id')
  async getMap(@Param('id') id: string, @Res() res: Response) {
    if (id.startsWith('favicon')) {
      return res.sendFile(path.join(__dirname, '..', 'public', 'favicon.ico'));
    }

    let map = await this.mapModel.findOne({ id });
    if (!map) {
      map = await this.mapModel.create({ id });
    }

    return res.sendFile(path.join(__dirname, '..', 'public', 'map.html'));
  }

  // @Get(':id/config')
  // async configMap(@Param('id') id: string, @Res() res: Response) {
  //   let map = await this.mapModel.findOne({ id });
  //   if (!map) {
  //     return res.status(404).sendFile(path.join(__dirname, '..', 'public', '404.html'));
  //   }

  //   return res.sendFile(path.join(__dirname, '..', 'public', 'config.html'));
  // }
}
