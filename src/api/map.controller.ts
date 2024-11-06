import { Body, Controller, Get, Param, Post, Put, Res, Headers } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MapDocument } from 'src/schemas/map.schema';
import { Map } from 'src/schemas/map.schema';
import { Response } from 'express';
import { AppGateway } from 'src/app.gateway';

@Controller('api/maps')
export class MapController {
  constructor(
    @InjectModel(Map.name) private mapModel: Model<MapDocument>,
    private appGateway: AppGateway,
  ) {}

  // Comando curl para actualizar el mapa:
  // curl -X PUT {{baseUrl}}/api/maps/{id} \
  // -H "Content-Type: application/json" \
  // -d '{
  //     "latitude": <nueva_latitud>,
  //     "longitude": <nueva_longitud>,
  //     "zoom": <nuevo_zoom>,
  //     "title": "<nuevo_titulo>",
  //     "description": "<nueva_descripcion>"
  // }'
  @Put(':id')
  async config(@Param('id') id: string, @Body() body: any, @Headers('authorization') auth: string, @Res() res: Response) {
    const map = await this.mapModel.findOne({ id });

    if (!map || map.id === 'demo') {
      return res.status(404).json({ message: 'Map not found' });
    }

    if (!auth || !auth.startsWith('Bearer ') || auth.split(' ')[1] !== map.api_key) {
      return res.status(401).json({ message: 'Invalid API key'});
    }

    const fieldsToUpdate = ['latitude', 'longitude', 'zoom', 'title', 'description'];

    if (!fieldsToUpdate.some(field => body[field] !== undefined)) {
      return res.status(400).json({ message: 'Any of these fields are required: latitude, longitude, zoom, title, description' });
    }

    fieldsToUpdate.forEach(field => {
      if (body[field] !== undefined) {
        map[field] = body[field];
      }
    });

    await map.save();

    this.appGateway.send('map:updated', { map });

    return res.status(200).json({ message: 'Map updated' });
  }
}
