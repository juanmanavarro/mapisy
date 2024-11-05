import { Controller, Get, Param, Render } from '@nestjs/common';
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
  async getIndex() {
    return { title: 'InstaMapp' };
  }

  @Get(':id')
  @Render('map')
  async getMap(@Param('id') id: string) {
    let map = await this.mapModel.findOne({ id });
    if (!map) {
      map = await this.mapModel.create({ id });
    }

    return { title: 'InstaMapp' };
  }
}
