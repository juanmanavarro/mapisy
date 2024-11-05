import { Body, Controller, Get, Param, Post, Render, Res } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MapDocument } from './schemas/map.schema';
import { Marker, MarkerDocument } from './schemas/marker.schema';
import { Response } from 'express';

@Controller()
export class AppController {
  constructor(
    @InjectModel(Map.name) private mapModel: Model<MapDocument>,
    @InjectModel(Marker.name) private markerModel: Model<MarkerDocument>,
  ) {}

  @Get()
  @Render('index')
  async getIndex() {
    const demoMap = {
      id: "demo",
      latitude: 0,
      longitude: -0.175781,
      zoom: 1,
      description: "",
      email: "instamapp@juanmanavar.ro",
      title: 'Demo'
    };

    let map = await this.mapModel.findOne({ id: demoMap.id });
    if (!map) {
      map = await this.mapModel.create(demoMap);
    }

    await this.markerModel.deleteMany({ map_id: map.id });

    const latitude = (Math.random() * 180 - 90) + 10;
    const longitude = (Math.random() * 360 - 180) + 10;

    return {
      title: 'InstaMapp',
      baseUrl: process.env.APP_URL,
      map,
      curlCommand: `curl -X POST ${process.env.APP_URL}/api/maps/demo/markers \\
    -H "Authorization: Bearer ${map.api_key}" \\
    -H "Content-Type: application/json" \\
    -d "{
      \\"latitude\\": ${latitude},
      \\"longitude\\": ${longitude}
    }"`,
    };
  }

  @Get(':id')
  @Render('map')
  async getMap(@Param('id') id: string) {
    let map = await this.mapModel.findOne({ id });
    if (!map) {
      map = await this.mapModel.create({ id });
    }

    await map.populate('markers');

    return {
      title: 'InstaMapp',
      map: JSON.stringify(map),
    };
  }

  @Post(':id')
  async configMap(@Param('id') id: string, @Body() body: any, @Res() res: Response) {
    if (!body.latitude || !body.longitude || !body.zoom || !body.email || !body.title) {
      return res.status(400).json({ message: 'Latitud, longitud, zoom y email son requeridos' });
    }

    await this.mapModel.updateOne({ id }, body);

    return res.redirect(`/${id}`);
  }
}
