import { Controller, Get, Param, Render } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MapDocument } from './schemas/map.schema';
import { Marker, MarkerDocument } from './schemas/marker.schema';

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

    return { title: 'InstaMapp' };
  }
}
