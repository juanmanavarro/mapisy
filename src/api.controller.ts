import { Controller, Get, Param } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MapDocument } from './schemas/map.schema';

@Controller('api')
export class ApiController {
  constructor(
    @InjectModel(Map.name) private mapModel: Model<MapDocument>,
  ) {}

  @Get('map/:id')
  async getMap(@Param('id') id: string) {
    const map = await this.mapModel.findOne({ id }).populate('markers');
    return map?.markers;
  }
}
