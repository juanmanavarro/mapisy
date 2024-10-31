import { Body, Controller, Get, Param, Post } from '@nestjs/common';
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
    return map;
  }

  @Post('map/:id/config')
  async configMap(@Param('id') id: string, @Body() body: any) {
    if (!body.latitude || !body.longitude || !body.zoom) {
      throw new Error('Latitud, longitud y zoom son requeridos');
    }

    await this.mapModel.updateOne({ id }, { $set: body });
  }
}
